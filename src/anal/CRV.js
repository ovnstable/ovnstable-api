
const web3Service = require('../web3Service.js');

let gauge = web3Service.gauge;
let crvPriceGetter = web3Service.crvPriceGetter;
let vault = web3Service.vault;

const chainLinkPrice = require('./price/chainLinkPrice.js');


async function _getCRV(blocks) {

    let results = [];
    for (let i = 0; i < blocks.length; i++) {
        let item = blocks[i];

        let block = item.block;

        let number;
        if (item.type !== 'PAYOUT'){
            number = await gauge.methods.claimable_reward(vault.options.address, "0x172370d5Cd63279eFa6d502DAB29171933a610AF").call({}, block ) / 10 ** 18
        }else {
            let claimedBefore = await gauge.methods.claimed_reward(vault.options.address, "0x172370d5Cd63279eFa6d502DAB29171933a610AF").call({}, block-1 ) / 10 ** 18
            let claimedAfter = await gauge.methods.claimed_reward(vault.options.address, "0x172370d5Cd63279eFa6d502DAB29171933a610AF").call({}, block+1 ) / 10 ** 18
            number = claimedAfter - claimedBefore;
        }

        let marketPrice = await chainLinkPrice.getPriceCRV(block);
        let liquidationPrice = await crvPriceGetter.methods.getUsdcSellPrice().call({}, block.block) / 10 ** 18;

        let netAssetValue = number * marketPrice;
        let liquidationValue = number * liquidationPrice;

        results.push({
            ...item,
            active: 'CRV',
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


    return results

}


module.exports = {
    getCRV: _getCRV,
}
