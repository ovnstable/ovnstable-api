const moment = require("moment");

const web3Service = require('../web3Service.js');
const {getLiq} = require("./utils");

let vault = web3Service.vault;
let a3CrvPriceGetter = web3Service.a3CrvPriceGetter;
let curve = web3Service.curve;
let am3CRV = web3Service.erc20('0xe7a24ef0c5e95ffb0f6684b813a78f2a3ad7d171');

async function _getAm3CRV(blocks) {

    let results = [];

    for (let i = 0; i < blocks.length; i++) {
        let item = blocks[i];

        let price = await a3CrvPriceGetter.methods.getUsdcBuyPrice().call({}, item.block)  / 10 ** 18;
        let positions = await am3CRV.methods.balanceOf(vault.options.address).call({}, item.block) / 10 ** 18;
        let netAssetValue = positions * price;

        let liq = await getLiq([0.1, 1, 10, 100], positions, item.block, getLiqPrice);

        results.push({
            ...item,
            ...liq,
            active: 'am3CRV',
            position: positions,
            block: item.block,
            transactionHash: item.transactionHash,
            date: item.date,
            marketPrice: price,
            netAssetValue: netAssetValue,
        });
    }


    return results;
}

async function getLiqPrice(amount,block) {
    return amount;
}


module.exports = {
    getAm3CRV: _getAm3CRV
}
