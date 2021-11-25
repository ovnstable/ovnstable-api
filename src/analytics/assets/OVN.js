const moment = require("moment");

const web3Service = require('../web3Service.js');
const {getLiq} = require("./utils");

let vault = web3Service.vault;
let ovn = web3Service.erc20('0xcE5bcF8816863A207BF1c0723B91aa8D5B9c6614');

async function _getOVN(blocks) {

    let results = [];

    for (let i = 0; i < blocks.length; i++) {
        let item = blocks[i];

        let price = 1;
        let positions = await ovn.methods.totalSupply().call({}, item.block) / 10 ** 6;

        let netAssetValue = positions * price;

        let liq = await getLiq(positions, item.block, () => price);

        results.push({
            ...item,
            ...liq,
            active: 'OVN',
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


module.exports = {
    getOVN: _getOVN
}
