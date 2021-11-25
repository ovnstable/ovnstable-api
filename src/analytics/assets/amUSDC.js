const moment = require("moment");

const web3Service = require('../web3Service.js');
const {getLiq} = require("./utils");
const {toFixed} = require("accounting-js");

let vault = web3Service.vault;
let amUSDC = web3Service.erc20('0x1a13F4Ca1d028320A707D99520AbFefca3998b7F')

async function _getAmUSDC(blocks) {

    let results = [];

    for (let i = 0; i < blocks.length; i++) {
        let item = blocks[i];

        let price = 1;
        let positions = await amUSDC.methods.balanceOf(vault.options.address).call({}, item.block) / 10 ** 6;

        let liq = await getLiq(positions, item.block, () => price);

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


module.exports = {
    getAmUSDC: _getAmUSDC
}
