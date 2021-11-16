const moment = require("moment");

const web3Service = require('../web3Service.js');

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

        let liqPrice = await getLiqPrice();
        let liquidationValue = liqPrice * positions;

        let netAssetValue = positions * price;

        results.push({
            ...item,
            active: 'am3CRV',
            position: positions,
            block: item.block,
            transactionHash: item.transactionHash,
            date: item.date,
            marketPrice: price,
            liquidationPrice: liqPrice,
            liquidationValue: liquidationValue,
            netAssetValue: netAssetValue,
        });
    }


    return results;
}

async function getLiqPrice(){


    let one = await curve.methods.coins(0).call();
    let second = await curve.methods.coins(1).call();
    let third = await curve.methods.coins(2).call();

    return 0;
}


module.exports = {
    getAm3CRV: _getAm3CRV
}
