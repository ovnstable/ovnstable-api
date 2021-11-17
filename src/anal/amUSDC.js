const moment = require("moment");

const web3Service = require('../web3Service.js');
const {getLiq} = require("./utils");

let vault = web3Service.vault;
let amUSDC = web3Service.erc20('0x1a13F4Ca1d028320A707D99520AbFefca3998b7F')

async function _getAmUSDC(blocks){

    let results = [];

    for (let i = 0; i < blocks.length; i++) {
        let item = blocks[i];

        let price = 1;
        let positions = await amUSDC.methods.balanceOf(vault.options.address).call({}, item.block) / 10 ** 6;

        let liq = await getLiq([0.1, 1, 10, 100], positions, item.block, getLiqPrice);

        results.push({
            ...item,
            ...liq,
            active: 'amUSDC',
            position: positions,
            block: item.block,
            transactionHash: item.transactionHash,
            date: item.date,
            marketPrice: price,
            netAssetValue: positions,
        });
    }


    return results;
}

async function getLiqPrice(amount,block) {
    return amount;
}


module.exports = {
    getAmUSDC: _getAmUSDC
}
