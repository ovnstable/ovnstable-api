const fs = require('fs');
const Web3 = require('web3');
let Curve = JSON.parse(fs.readFileSync('./contracts/iCurvePool.json'));
let Gauge = JSON.parse(fs.readFileSync('./contracts/IRewardOnlyGauge.json'));
let Exchange = JSON.parse(fs.readFileSync('./contracts/Exchange.json'));
let Vault = JSON.parse(fs.readFileSync('./contracts/Vault.json'));
const EthDater = require('ethereum-block-by-date');
const moment = require("moment");
const axios = require("axios");

const payouts = require('./src/payouts.js');

let web3URL = 'https://polygon-mainnet.infura.io/v3/66f5eb50848f458cb0f0506cc1036fea'
console.log('Web3 URL ' + web3URL)
let web3 = new Web3(web3URL);
web3.eth.net.getId().then(value => {
    console.log('Network ID' + value)
});


let curve = new web3.eth.Contract(Curve.abi, '0x445FE580eF8d70FF569aB36e80c647af338db351');
let gauge = new web3.eth.Contract(Gauge.abi, '0x19793B454D3AfC7b454F206Ffe95aDE26cA6912c');
let vault = new web3.eth.Contract(Vault.abi, Vault.networks[137].address);
let exchange = new web3.eth.Contract(Exchange.abi, Exchange.networks[137].address);

const dater = new EthDater(
    web3 // Web3 object, required.
);


async function getRewards(blocks) {




    console.log("CRV:")

    let results = [];
    for (let i = 0; i < blocks.length; i++) {
        let item = blocks[i];

        let block = item.block;

        let claimedBefore = await gauge.methods.claimed_reward(vault.options.address, "0x172370d5Cd63279eFa6d502DAB29171933a610AF").call({}, block-1 ) / 10 ** 18
        console.log("claimed_reward: " + claimedBefore)
        // let claimableBefore = await gauge.methods.claimable_reward(vault.options.address, "0x172370d5Cd63279eFa6d502DAB29171933a610AF").call({}, block-1) / 10 ** 18
        // console.log("claimable_reward: " + claimableBefore)

        let claimedAfter = await gauge.methods.claimed_reward(vault.options.address, "0x172370d5Cd63279eFa6d502DAB29171933a610AF").call({}, block+1 ) / 10 ** 18
        console.log("claimed_reward: " + claimedAfter)
        // let claimableAfter = await gauge.methods.claimable_reward(vault.options.address, "0x172370d5Cd63279eFa6d502DAB29171933a610AF").call({}, block+1) / 10 ** 18
        // console.log("claimable_reward: " + claimableAfter)



        console.log('Transaction hash: ' + item.transactionHash)
        console.log('claimed delta: ' + (claimedAfter - claimedBefore));
        // console.log('claimable delta: ' + (claimableAfter- claimableBefore));
    }




    return results;
}


payouts.getPayouts(100).then(value => {

    let blocks = [];

    for (let i = 0; i < value.length; i++) {
        let element = value[i];

        blocks.push({
            block: element.block,
            transactionHash: element.transaction_hash
        })
    }

    getRewards(blocks).then(value => {
        console.log(JSON.stringify(value))
    })
})


async function getCurvePrices() {
    let blocks = await dater.getEvery('hours', '2021-11-01T00:00:00Z', '2021-11-11T00:00:00Z', 2);

    let result = [];

    for (let i = 0; i < blocks.length; i++) {
        let block = blocks[i];

        console.log('Get value for block: ' + block.block + " date " + block.date);

        let value = await curve.methods.get_virtual_price().call({}, block.block);

        result.push({
            value: value / 10 ** 18,
            date: moment(block.date).format('YYYY-MM-DD HH:mm'),
        });
    }


    return result;
}


// getCurvePrices().then(value => {
//     console.log(JSON.stringify(value))
// })

