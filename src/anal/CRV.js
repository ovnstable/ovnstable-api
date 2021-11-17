let debug = require('debug')('crv');

const web3Service = require('../web3Service.js');
let gauge = web3Service.gauge;
let crvPriceGetter = web3Service.crvPriceGetter;
let vault = web3Service.vault;

const chainLinkPrice = require('./price/chainLinkPrice.js');
const {toFixed} = require("accounting-js");
const {getLiq} = require("./utils");


async function _getCRV(blocks) {

    let results = [];
    for (let i = 0; i < blocks.length; i++) {
        let item = blocks[i];

        let block = item.block;

        let number;
        if (item.type !== 'PAYOUT AFTER' && item.type !== 'PAYOUT BEFORE'){
            number = await gauge.methods.claimable_reward_write(vault.options.address, "0x172370d5Cd63279eFa6d502DAB29171933a610AF").call({}, block ) / 10 ** 18
        }else {
            let claimedBefore = await gauge.methods.claimed_reward(vault.options.address, "0x172370d5Cd63279eFa6d502DAB29171933a610AF").call({}, block-1 ) / 10 ** 18
            let claimedAfter = await gauge.methods.claimed_reward(vault.options.address, "0x172370d5Cd63279eFa6d502DAB29171933a610AF").call({}, block+1 ) / 10 ** 18
            number = claimedAfter - claimedBefore;
        }

        let marketPrice = await chainLinkPrice.getPriceCRV(block);
        let netAssetValue = number * marketPrice;

        let liq = await getLiq([0.1, 1, 10, 100], number, block, getLiqPrice);

        results.push({
            ...item,
            ...liq,
            active: 'CRV',
            position: number,
            block: item.block,
            transactionHash: item.transactionHash,
            date: item.date,
            marketPrice: marketPrice,
            netAssetValue: netAssetValue,
        });


    }


    return results

}

async function getLiqPrice(amount,block) {

    if (amount === 0)
        return 0;

    try {
        let value = toFixed(amount * 10 ** 18, 0)

        let res = [];
        res[0] = '0x172370d5Cd63279eFa6d502DAB29171933a610AF' // CRV
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
    getCRV: _getCRV,
}
