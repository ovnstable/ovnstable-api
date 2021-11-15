
const web3Service = require('../web3Service.js');

let gauge = web3Service.gauge;
let crvPriceGetter = web3Service.crvPriceGetter;
let vault = web3Service.vault;

async function _getCRV(blocks) {

    let results = [];
    for (let i = 0; i < blocks.length; i++) {
        let item = blocks[i];

        let block = item.block;

        let claimedBefore = await gauge.methods.claimed_reward(vault.options.address, "0x172370d5Cd63279eFa6d502DAB29171933a610AF").call({}, block-1 ) / 10 ** 18
        let claimedAfter = await gauge.methods.claimed_reward(vault.options.address, "0x172370d5Cd63279eFa6d502DAB29171933a610AF").call({}, block+1 ) / 10 ** 18
        let number = claimedAfter - claimedBefore;

        let marketPrice = await crvPriceGetter.methods.getUsdcBuyPrice().call({}, block.block) / 10 ** 18;
        let liquidationPrice = await crvPriceGetter.methods.getUsdcSellPrice().call({}, block.block) / 10 ** 18;


        results.push({
            ...item,
            active: 'CRV',
            position: number,
            block: item.block,
            transactionHash: item.transactionHash,
            date: item.date,
            marketPrice: marketPrice,
            liquidationPrice: liquidationPrice,
            liquidationValue: 0,
            netAssetValue: 0,
        });


    }


    return results

}


module.exports = {
    getCRV: _getCRV,
}
