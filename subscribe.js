const Web3 = require('web3');
let axios = require('axios');
const {Sequelize, DataTypes} = require('sequelize');

let sheet = require('./pushToSheet.js');

const fs = require('fs');

let accounting = require("accounting-js")
const e = require("express");
let accountingConfig = {
    symbol: "",
    precision: 6,
    thousand: " ",
};

let Exchange = JSON.parse(fs.readFileSync('./contracts/Exchange.json'));
let M2m = JSON.parse(fs.readFileSync('./contracts/Mark2Market.json'));
let Ovn = JSON.parse(fs.readFileSync('./contracts/OvernightToken.json'));

// let web3 = new Web3('https://polygon-mainnet.infura.io/v3/66f5eb50848f458cb0f0506cc1036fea');
let web3 = new Web3('ws://localhost:8555');
web3.eth.net.getId().then(value => {
    console.log(value)
});


let exchange = new web3.eth.Contract(Exchange.abi, Exchange.networks[137].address);
let m2m = new web3.eth.Contract(M2m.abi, M2m.networks[137].address);
let ovn = new web3.eth.Contract(Ovn.abi, Ovn.networks[137].address);

const sequelize = new Sequelize('postgres://ovn_user:ovn_password@localhost:5432/ovn_analytics')


try {
    sequelize.authenticate().then(value => {
        console.log('Соединение с БД было успешно установлено')
    })
} catch (e) {
    console.log('Невозможно выполнить подключение к БД: ', e)
}
//
// let asset = sequelize.define('Asset', {
//         id: {type: DataTypes.STRING, primaryKey: true},
//         symbol: DataTypes.STRING,
//         decimals: DataTypes.STRING,
//         name: DataTypes.STRING,
//         amountInVault: DataTypes.NUMBER_TYPE,
//         usdcPriceInVault: DataTypes.STRING,
//     },
//     {
//         timestamps: true,
//         tableName: 'asset_prices_for_balance',
//         underscored: true,
//     }
// );

// const jane = asset.create({id: 'Jane'})


// a list for saving subscribed event instances
const subscribedEvents = {}

const subscribeLogEvent = async (contract, eventName) => {

    console.log('Subscribe: ' + eventName)
    const eventJsonInterface = contract._jsonInterface.find((value, index) => value.name === eventName && value.type === 'event');
    const subscription = web3.eth.subscribe('logs', {
        address: contract.options.address,
        topics: [eventJsonInterface.signature]
    }, (error, result) => {

        console.log(error)
        console.log(result.data)
        if (!error) {
            const eventObj = web3.eth.abi.decodeLog(eventJsonInterface.inputs, result.data, result.topics.slice(1))
            console.log(`New ${eventName}!`, eventObj)
            let date = new Date();

            if (eventName === 'EventExchange'){
                let type = getType(eventObj);

                let res = {
                    amount: eventObj[1] /10 ** 6,
                    amountFee: eventObj[2] /10 ** 6,
                    sender: eventObj[3]
                }

                saveActive(date, type, res)
                saveOvn(date, type, res)
            }else {

                let res = {
                    amount: "0",
                    amountFee: "0",
                    sender:"",
                }

                saveActive(date, 'Reward', res)
                saveOvn(date, 'Reward', res)
            }

        }
    })
    subscribedEvents[eventName] = subscription
}


function getType(eventObject){

    let type = eventObject[0];

    switch (type){
        case 'buy':
            return 'Mint';
        case 'redeem':
            return 'Redeem';
    }

}

function saveOvn(date, type, res){

    let totalOvn = ovn.methods.totalSupply().call();

    totalOvn.then(value => {

        let item = {
            createAt: date,
            active: 'ovn',
            activeName: 'OvernightToken',
            position: value / 10 ** 6,
            marketPrice: "0",
            netAssetValue: "0",
            liquidationPrice: "0",
            liquidationValue: "0",
            type: type,
            amount: res.amount,
            amountFee: res.amountFee,
            sender: res.sender

        };
        console.log(item)
        sheet.pushToSheet(item);

    })
}


function saveActive(date, type, res){
    let data = m2m.methods.assetPricesForBalance().call();
    data.then(value => {

        let items = value.assetPrices;

        for (let i = 0; i < items.length; i++) {

            let element = items[i];

            let symbol = element.symbol;
            let name = element.name;
            let bookValue = element.amountInVault / element.usdcPriceDenominator;
            let liquidationValue = element.usdcPriceInVault / element.usdcPriceDenominator;
            let price = element.usdcBuyPrice/ element.usdcPriceDenominator;
            let liquidationPrice = element.usdcSellPrice / element.usdcPriceDenominator;
            let bookPrice = element.usdcPriceInVault / element.usdcPriceDenominator ;

            if (!bookValue)
                bookValue = "0";

            if (!liquidationValue)
                liquidationValue = "0"

            if (!bookPrice)
                bookPrice = "0";

            let item = {
                createAt: date,
                active: symbol,
                activeName: name,
                position: bookValue,
                marketPrice: price,
                netAssetValue: bookPrice,
                liquidationPrice: liquidationPrice,
                liquidationValue: liquidationValue,
                type: type,
                amount: res.amount,
                amountFee: res.amountFee,
                sender: res.sender
            };

            console.log(item)
            sheet.pushToSheet(item);
        }

    });
}



subscribeLogEvent(exchange, 'EventExchange')
subscribeLogEvent(exchange, 'RewardEvent');
