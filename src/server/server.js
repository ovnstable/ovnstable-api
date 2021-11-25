const dotenv = require('dotenv');
dotenv.config();
const cron = require('node-cron');
const web3utils = require('./web3Utils.js');
let debug = require('debug')('server')

const payouts = require('../common/payouts');

async function load() {

    let totalSupply = 0;
    let totalBurn = 0;
    let totalMint = 0;
    try {
        totalSupply = await web3utils.ovn.methods.totalSupply().call() / 10 ** 6;
        totalBurn = await web3utils.ovn.methods.totalBurn().call() / 10 ** 6;
        totalMint = await web3utils.ovn.methods.totalMint().call() / 10 ** 6;
    } catch (e) {
        debug("Error: " + e)
    }

    return {
        totalMint: totalMint,
        totalBurn: totalBurn,
        totalSupply: totalSupply,
    };
}

async function activePrices() {
    return await web3utils.m2m.methods.assetPricesForBalance().call();
}


const express = require('express')
const server = express()
const port = 3000

server.get('/api/total', (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    load().then(value => {

        res.end(JSON.stringify(value));
    }).catch(reason => {
        debug("Error " + reason)
        res.status(400)
        res.end();
    })

});

server.get('/api/load-payouts', (req, res) => {
    debug('API: Load-payouts')
    payouts.loadPayouts();
    res.end();
})


server.get('/api/payouts', (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    payouts.getPayouts(10).then(value => {

        value = value.map(item => {

            return {
                transactionHash: item.transaction_hash,
                payableDate: item.payable_date,
                dailyProfit: item.daily_profit,
                annualizedYield: item.annualized_yield,
            }
        })


        res.end(JSON.stringify(value));
    }).catch(reason => {
        debug("Error: " + reason)
        res.status(400)
        res.end();
    })

});

server.get('/api/prices', (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
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

        res.end(JSON.stringify(items));
    }).catch(reason => {
        debug("Error: " + reason)
        res.status(400)
        res.end();
    })
});


server.listen(port, () => {
    debug(`app listening at http://localhost:${port}`)
});


debug('Start Cron')

cron.schedule('00 00 * * *', () => {
    debug('Run cron reward ');
    runReward();
});


// Every hour
cron.schedule('0 * * * *', () => {

    debug('Run cron - load payouts')
    payouts.loadPayouts();

});


const PRIV_KEY = process.env.pk

if (PRIV_KEY) {
    debug('PK Key found')
} else {
    debug('PK Key not found')

}

function runReward() {

    let exchange = web3utils.exchange;
    let web3 = web3utils.web3;

    const from = "0x5CB01385d3097b6a189d1ac8BA3364D900666445" // Ovn ADMIN account
    const to = exchange.options.address;

    web3.eth.getTransactionCount(from, function (err, nonce) {

        const txData = {
            from: from,
            nonce: nonce,
            gasPrice: web3.utils.toHex(web3.utils.toWei('40', 'gwei')),
            gasLimit: 6721975,
            to: to,
            value: '0x0',
            data: exchange.methods.reward().encodeABI()
        }

        debug('Tx data: ' + txData)

        web3.eth.accounts.signTransaction(txData, PRIV_KEY).then(value => {

            const sentTx = web3.eth.sendSignedTransaction(value.raw || value.rawTransaction);
            sentTx.on("receipt", receipt => {
                debug(receipt);
            });
            sentTx.on("error", err => {
                debug(err);
            });
        });


    });

}


