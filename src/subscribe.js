let sheet = require('./pushToSheet.js');
let dataBase = require('./database.js');
let web3Service = require('./web3Service.js');


let web3 = web3Service.web3;
let exchange = web3Service.exchange;
let m2m = web3Service.m2m;
let ovn = web3Service.ovn;

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
            createdAt: date,
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
        dataBase.save(item);
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
                createdAt: date,
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
            dataBase.save(item);
        }

    });
}



subscribeLogEvent(exchange, 'EventExchange')
subscribeLogEvent(exchange, 'RewardEvent');
