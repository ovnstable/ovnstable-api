const Web3 = require('web3');
let axios = require('axios');

const fs = require('fs');

let OverNightToken = JSON.parse(fs.readFileSync('./OvernightToken.json'));
let Exchange = JSON.parse(fs.readFileSync('./Exchange.json'));
let M2m = JSON.parse(fs.readFileSync('./Mark2Market.json'));

// let web3 = new Web3('https://polygon-mainnet.infura.io/v3/66f5eb50848f458cb0f0506cc1036fea');
let web3 = new Web3('https://polygon-rpc.com/');
// let web3 = new Web3('http://localhost:8555');
web3.eth.net.getId().then(value => {
    console.log(value)
});


console.log(`OverNightToken.networks[137].address: ${OverNightToken.networks[137].address}`)
console.log(`M2m.networks[137].address: ${M2m.networks[137].address}`)
console.log(`Exchange.networks[137].address: ${Exchange.networks[137].address}`)

let contract = new web3.eth.Contract(OverNightToken.abi, OverNightToken.networks[137].address);
let M2mContract = new web3.eth.Contract(M2m.abi, M2m.networks[137].address);
let exchange = new web3.eth.Contract(Exchange.abi, Exchange.networks[137].address);


async function load() {

    let totalSupply = await contract.methods.totalSupply().call();
    let totalBurn = await contract.methods.totalBurn().call();
    let totalMint = await contract.methods.totalMint().call();

    let request = {
        totalMint: totalMint / 10 ** 6,
        totalBurn: totalBurn / 10 ** 6,
        totalSupply: totalSupply / 10 ** 6,
    }

    return request;
}

async function activePrices() {

    let result = await M2mContract.methods.assetPricesForBalance().call();
    return result;
}

async function payouts() {

    let address = exchange.options.address;
    let token = 'YZPR4G2H7JSIIPXI5NTWN5G1HDX43GSUCR';
    let topik = '0x6997cdab3aebbbb5a28dbdf7c61a3c7e9ee2c38784bbe66b9c4e58078e3b587f';
    let fromBlock = 19022018;
    let toBlock = await web3.eth.getBlockNumber();

    return axios.get(`https://api.polygonscan.com/api?module=logs&action=getLogs&fromBlock=${fromBlock}&toBlock=${toBlock}&address=${address}&topic0=${topik}&apikey=${token}`);

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

server.get('/api/payouts', (req, res) => {

    payouts().then(value => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(value.data));
    });
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
    console.log(`app listening at http://localhost:${port}`)
});


var cron = require('node-cron');

console.log('Start Cron')

cron.schedule('59 23 * * *', () => {
    console.log('Run cron');
    runReward();
});


const PRIV_KEY = process.env.pk

if (PRIV_KEY) {
    console.log('PK Key found')
} else {
    console.log('PK Key not found')

}

function runReward() {

    let address = Exchange.networks[137].address;
    let exchange = new web3.eth.Contract(Exchange.abi, address);

    const from = "0x5CB01385d3097b6a189d1ac8BA3364D900666445" // Ovn ADMIN account
    const to = address // Exchange

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

        console.log('Tx data: ' + txData)

        web3.eth.accounts.signTransaction(txData, PRIV_KEY).then(value => {

            const sentTx = web3.eth.sendSignedTransaction(value.raw || value.rawTransaction);
            sentTx.on("receipt", receipt => {
                console.log(receipt);
            });
            sentTx.on("error", err => {
                console.log(err);
            });
        });

    });

}

