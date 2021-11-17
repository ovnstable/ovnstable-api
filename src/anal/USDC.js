const moment = require("moment");


const web3Service = require('../web3Service.js');
const {getLiq} = require("./utils");

let vault = web3Service.vault;
let usdc = web3Service.erc20('0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174');

async function _getUSDC(blocks){

    let results = [];

    for (let i = 0; i < blocks.length; i++) {
        let item = blocks[i];

        let price = 1;
        let positions = await usdc.methods.balanceOf(vault.options.address).call({}, item.block) / 10 ** 6;
        let liq = await getLiq([0.1, 1, 10, 100], positions, item.block, getLiqPrice);

        results.push({
            ...item,
            ...liq,
            active: 'USDC',
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
    getUSDC: _getUSDC
}
