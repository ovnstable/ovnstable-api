
const web3Service = require('../web3Service.js');

let gauge = web3Service.gauge;
let wMaticPriceGetter = web3Service.wMaticPriceGetter;
let vault = web3Service.vault;


async function _getWmatic(blocks) {


    let results = [];
    for (let i = 0; i < blocks.length; i++) {
        let item = blocks[i];

        let block = item.block;

        let claimedBefore = await gauge.methods.claimed_reward(vault.options.address, "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270").call({}, block - 1) / 10 ** 18
        let claimedAfter = await gauge.methods.claimed_reward(vault.options.address, "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270").call({}, block + 1) / 10 ** 18
        let number = claimedAfter - claimedBefore;

        let marketPrice = await wMaticPriceGetter.methods.getUsdcBuyPrice().call({}, block.block) / 10 ** 18;
        let liquidationPrice = await wMaticPriceGetter.methods.getUsdcSellPrice().call({}, block.block) / 10 ** 18;

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

module.exports = {
    getWmatic: _getWmatic,
}
