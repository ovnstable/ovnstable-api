const Web3 = require('web3');
let axios = require('axios');
const {Sequelize, DataTypes} = require('sequelize');

const fs = require('fs');

let Exchange = JSON.parse(fs.readFileSync('./contracts/Exchange.json'));
let M2m = JSON.parse(fs.readFileSync('./contracts/Mark2Market.json'));

// let web3 = new Web3('https://polygon-mainnet.infura.io/v3/66f5eb50848f458cb0f0506cc1036fea');
let web3 = new Web3('ws://localhost:8555');
web3.eth.net.getId().then(value => {
    console.log(value)
});


let exchange = new web3.eth.Contract(Exchange.abi, Exchange.networks[137].address);
let m2m = new web3.eth.Contract(M2m.abi, M2m.networks[137].address);

const sequelize = new Sequelize('postgres://ovn_user:ovn_password@localhost:5432/ovn_analytics')


try {
    sequelize.authenticate().then(value => {
        console.log('Соединение с БД было успешно установлено')
    })
} catch (e) {
    console.log('Невозможно выполнить подключение к БД: ', e)
}

let asset = sequelize.define('Asset', {
        id: {type: DataTypes.STRING, primaryKey: true},
        symbol: DataTypes.STRING,
        decimals: DataTypes.STRING,
        name: DataTypes.STRING,
        amountInVault: DataTypes.NUMBER_TYPE,
        usdcPriceInVault: DataTypes.STRING,
    },
    {
        timestamps: true,
        tableName: 'asset_prices_for_balance',
        underscored: true,
    }
);

const jane = asset.create({id: 'Jane'})


// a list for saving subscribed event instances
const subscribedEvents = {}

const subscribeLogEvent = (contract, eventName) => {

    console.log('Subscribe: ' + eventName)
    const eventJsonInterface = contract._jsonInterface.find((value, index) => value.name === eventName && value.type === 'event');
    const subscription = web3.eth.subscribe('logs', {
        address: contract.options.address,
        topics: [eventJsonInterface.signature]
    }, (error, result) => {
        if (!error) {
            const eventObj = web3.eth.abi.decodeLog(eventJsonInterface.inputs, result.data, result.topics.slice(1))
            console.log(`New ${eventName}!`, eventObj)


            let result = m2m.methods.assetPricesForBalance().call();
            result.then(value => {

                for (let i = 0; i < value.length; i++) {

                    let element = value[i];

                    asset.create({
                        symbol: element.symbol,
                        decimals: element.decimals,
                        name: element.name,
                        amountInVault: element.amountInVault,
                        usdcPriceInVault: element.usdcPriceInVault,
                        usdcBuyPrice: element.usdcBuyPrice,
                        usdcSellPrice: element.usdcSellPrice,
                        usdcPriceDenominator: element.usdcPriceDenominator,
                    });
                }

            })
        }
    })
    subscribedEvents[eventName] = subscription
}

subscribeLogEvent(exchange, 'EventExchange')
