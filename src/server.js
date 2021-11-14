let axios = require('axios');
const web3Service = require('./web3Service.js');

let log = require('log');

const widget = require('./widget.js')

const payouts = require('./payouts');


async function load() {

    let totalSupply = await web3Service.ovn.methods.totalSupply().call();
    let totalBurn = await web3Service.ovn.methods.totalBurn().call();
    let totalMint = await web3Service.ovn.methods.totalMint().call();

    let request = {
        totalMint: totalMint / 10 ** 6,
        totalBurn: totalBurn / 10 ** 6,
        totalSupply: totalSupply / 10 ** 6,
    }

    return request;
}

async function activePrices() {

    let result = await web3Service.m2m.methods.assetPricesForBalance().call();
    return result;
}



const express = require('express')
const server = express()
const port = 3000

server.get('/api/total', (req, res) => {

    load().then(value => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(value));
    })

});

server.get('/api/load-payouts', () => {
    payouts.loadPayouts();
})

server.get('/api/update-widgets', () =>{
    widget.updateWidgetFromSheet();
})

server.get('/api/widget/:widgetId', (req, res) => {


    let widgetId = req.params.widgetId;
    switch (widgetId){
        case 'polybor':
            widget.polybor().then(value => {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(value));
            });
            break;
        case 'polybor-week':
            widget.polyborWeek().then(value => {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(value));
            });
            break;
        case 'polybor-weeks':
            widget.polyborWeeks().then(value => {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(value));
            });
            break;
        case 'interest-rate':
            widget.interestRate().then(value => {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(value));
            });
            break;
        case 'distribution-rate':
            widget.distributionRate().then(value => {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(value));
            });
            break;


        default:
            log.info('Unknown widget id '  + widgetId)
    }


});


server.get('/api/payouts', (req, res) => {


    payouts.getPayouts(10).then(value => {

        value = value.map(item => {

            return {
                transactionHash: item.transaction_hash,
                payableDate: item.payable_date,
                dailyProfit: item.daily_profit,
                annualizedYield: item.annualized_yield,
            }
        })

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(value));
    })

});

server.get('/api/prices', (req, res) => {


    activePrices().then(value => {

        value = value.assetPrices;
        let items = [];
        for (let i = 0; i < value.length; i++) {

            let element = value[i];
            items.push({
                symbol: element.symbol,
                decimals: element.decimals,
                name: element.name,
                amountInVault: element.amountInVault,
                usdcPriceInVault: element.usdcPriceInVault,
                usdcBuyPrice: element.usdcBuyPrice,
                usdcSellPrice: element.usdcSellPrice,
                usdcPriceDenominator: element.usdcPriceDenominator,
            })
        }

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(items));
    })
});


server.listen(port, () => {
    log.info(`app listening at http://localhost:${port}`)
});


var cron = require('node-cron');

log.info('Start Cron')

cron.schedule('00 00 * * *', () => {
    log.info('Run cron reward');
    runReward();
});

cron.schedule('59 4 * * *', () => {

    log.info('Run cron - load payouts')
    payouts.loadPayouts().then(value => {

        setTimeout(args => {
            log.info('Run cron - Update Widget')
            widget.updateWidgetFromSheet();

        }, 5 * 60 * 1000);
    })

});


const PRIV_KEY = process.env.pk

if (PRIV_KEY) {
    log.info('PK Key found')
} else {
    log.info('PK Key not found')

}

function runReward() {

    let exchange = web3Service.exchange;
    let web3 = web3Service.web3;

    const from = "0x5CB01385d3097b6a189d1ac8BA3364D900666445" // Ovn ADMIN account
    const to = exchange.options.address;

    web3.eth.getTransactionCount(from, function (err, nonce) {

        const txData = {
            from: from,
            nonce: nonce,
            gasPrice: web3.utils.toHex(web3.utils.toWei('15', 'gwei')),
            gasLimit: 6721975,
            to: to,
            value: '0x0',
            data: exchange.methods.reward().encodeABI()
        }

        log.info('Tx data: ' + txData)

        web3.eth.accounts.signTransaction(txData, PRIV_KEY).then(value => {

            const sentTx = web3.eth.sendSignedTransaction(value.raw || value.rawTransaction);
            sentTx.on("receipt", receipt => {
                log.info(receipt);
            });
            sentTx.on("error", err => {
                log.info(err);
            });
        });



    });

}


