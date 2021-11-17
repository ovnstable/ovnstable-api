const moment = require("moment");

const web3Service = require('../web3Service.js');
const {getLiq} = require("./utils");
const {toFixed} = require("accounting-js");

let vault = web3Service.vault;
let a3CrvPriceGetter = web3Service.a3CrvPriceGetter;
let am3CRV = web3Service.erc20('0xe7a24ef0c5e95ffb0f6684b813a78f2a3ad7d171');
let ZERO_ETHER = web3Service.web3.utils.toWei('0', 'ether');

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

async function getLiqPrice(amount, block) {

    let fixed = toFixed(amount * 10 ** 6, 0);
    // index = 1 = amUSDC
    const amounts = [ZERO_ETHER, fixed, ZERO_ETHER];

    // return value with slippage without fee
    // https://curve.readthedocs.io/factory-deposits.html#DepositZap.calc_token_amount

    let result = await web3Service.curve.methods.calc_token_amount(amounts, false).call({}, block);
    return (result / 10 ** 18) / amount;
}


module.exports = {
    getAm3CRV: _getAm3CRV
}
