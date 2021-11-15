const moment = require("moment");

const web3Service = require('../web3Service.js');

let vault = web3Service.vault;
let a3CrvPriceGetter = web3Service.a3CrvPriceGetter;
let am3CRV = web3Service.erc20('0xe7a24ef0c5e95ffb0f6684b813a78f2a3ad7d171');

async function _getAm3CRV(blocks) {

    let results = [];

    for (let i = 0; i < blocks.length; i++) {
        let item = blocks[i];

        let price = await a3CrvPriceGetter.methods.getUsdcBuyPrice().call({}, item.block)  / 10 ** 18;
        let positions = await am3CRV.methods.balanceOf(vault.options.address).call({}, item.block) / 10 ** 18;

        let netAssetValue = positions * price;

        results.push({
            ...item,
            active: 'am3CRV',
            position: positions,
            block: item.block,
            transactionHash: item.transactionHash,
            date: moment(item.date).format('YYYY-MM-DD HH:mm'),
            marketPrice: price,
            liquidationPrice: price,
            liquidationValue: netAssetValue,
            netAssetValue: netAssetValue,
        });
    }


    return results;
}


module.exports = {
    getAm3CRV: _getAm3CRV
}
