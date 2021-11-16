let debug = require('debug')('wmatic');

const web3Service = require('../web3Service.js');

let gauge = web3Service.gauge;
let wMaticPriceGetter = web3Service.wMaticPriceGetter;
let vault = web3Service.vault;

const chainLinkPrice = require('./price/chainLinkPrice.js');
const {toFixed} = require("accounting-js");

async function _getWmatic(blocks) {


    let results = [];
    for (let i = 0; i < blocks.length; i++) {
        let item = blocks[i];

        let block = item.block;

        let number;
        if (item.type !== 'PAYOUT AFTER' && item.type !== 'PAYOUT BEFORE'){
            number = await gauge.methods.claimable_reward_write(vault.options.address, "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270").call({}, block ) / 10 ** 18
        }else {
            let claimedBefore = await gauge.methods.claimed_reward(vault.options.address, "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270").call({}, block-1 ) / 10 ** 18
            let claimedAfter = await gauge.methods.claimed_reward(vault.options.address, "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270").call({}, block+1 ) / 10 ** 18
            number = claimedAfter - claimedBefore;
        }

        let marketPrice = await chainLinkPrice.getPriceMatic(block);
        let liquidationPrice = await getLiqPrice(number, block);

        let netAssetValue = number * marketPrice;
        let liquidationValue = number * liquidationPrice;

        results.push({
            ...item,
            active: 'WMATIC',
            position: number,
            block: item.block,
            transactionHash: item.transactionHash,
            date: item.date,
            marketPrice: marketPrice,
            liquidationPrice: liquidationPrice,
            liquidationValue: liquidationValue,
            netAssetValue: netAssetValue,
        });
    }


    return results;
}

async function getLiqPrice(amount,block) {

    if (amount === 0)
        return 0;

    try {
        let value = toFixed(amount * 10 ** 18, 0)

        let res = [];
        res[0] = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270' // Wmatic
        res[1] = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174' // USDC

        let toBN = web3Service.web3.utils.toBN(value);
        let amountsOut = await web3Service.swapRouter.methods.getAmountsOut(toBN, res).call({}, block);
        let price = ((amountsOut[1] * (10**12) * 10**18)/ amountsOut[0]) / 10 ** 18
        return price;
    } catch (e) {
        debug('Error ' + e)
        return 0;
    }
}

module.exports = {
    getWmatic: _getWmatic,
}
