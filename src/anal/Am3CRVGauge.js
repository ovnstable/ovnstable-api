const moment = require("moment");

const web3Service = require('../web3Service.js');

let vault = web3Service.vault;
let a3CrvGaugePriceGetter = web3Service.a3CrvGaugePriceGetter;

let am3CRVGauge = web3Service.erc20('0xe381c25de995d62b453af8b931aac84fccaa7a62');

async function _getAm3CRVGauge(blocks){

    let results = [];

    for (let i = 0; i < blocks.length; i++) {
        let item = blocks[i];

        let price = await a3CrvGaugePriceGetter.methods.getUsdcBuyPrice().call({}, item.block)  / 10 ** 18;
        let positions = await am3CRVGauge.methods.balanceOf(vault.options.address).call({}, item.block) / 10 ** 18;
        results.push({
            ...item,
            active: 'am3CRV-gauge',
            position: positions,
            block: item.block,
            transactionHash: item.transactionHash,
            date: moment(item.date).format('YYYY-MM-DD HH:mm'),
            marketPrice: price,
            liquidationPrice: price,
            liquidationValue: 0,
            netAssetValue: 0,
        });
    }


    return results;
}


module.exports = {
    getAm3CRVGauge: _getAm3CRVGauge
}
