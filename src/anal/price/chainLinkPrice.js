const dotenv = require('dotenv');
dotenv.config();

const web3Service = require('../../web3Service.js');
const aggregatorV3InterfaceABI = [{
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [],
    "name": "description",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint80", "name": "_roundId", "type": "uint80"}],
    "name": "getRoundData",
    "outputs": [{"internalType": "uint80", "name": "roundId", "type": "uint80"}, {
        "internalType": "int256",
        "name": "answer",
        "type": "int256"
    }, {"internalType": "uint256", "name": "startedAt", "type": "uint256"}, {
        "internalType": "uint256",
        "name": "updatedAt",
        "type": "uint256"
    }, {"internalType": "uint80", "name": "answeredInRound", "type": "uint80"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [],
    "name": "latestRoundData",
    "outputs": [{"internalType": "uint80", "name": "roundId", "type": "uint80"}, {
        "internalType": "int256",
        "name": "answer",
        "type": "int256"
    }, {"internalType": "uint256", "name": "startedAt", "type": "uint256"}, {
        "internalType": "uint256",
        "name": "updatedAt",
        "type": "uint256"
    }, {"internalType": "uint80", "name": "answeredInRound", "type": "uint80"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [],
    "name": "version",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
}]
const crv = new web3Service.web3.eth.Contract(aggregatorV3InterfaceABI, '0x336584C8E6Dc19637A5b36206B1c79923111b405')
const matic = new web3Service.web3.eth.Contract(aggregatorV3InterfaceABI, '0xAB594600376Ec9fD91F8e885dADF0CE036862dE0')
const amUSDC = new web3Service.web3.eth.Contract(aggregatorV3InterfaceABI, '0x72484B12719E23115761D5DA1646945632979bB6')

async function _getPriceAmUSDC(block){
    return await amUSDC.methods.latestRoundData().call({}, block)
        .then((roundData) => {
            return roundData.answer / 10 ** 8;
        });
}

async function _getPriceCRV(block){
    return await crv.methods.latestRoundData().call({}, block)
        .then((roundData) => {
            return roundData.answer / 10 ** 8;
        });
}

async function _getPriceMatic(block){
    return await matic.methods.latestRoundData().call({}, block)
        .then((roundData) => {
            return roundData.answer / 10 ** 8;
        });
}


module.exports = {
    getPriceCRV: _getPriceCRV,
    getPriceMatic: _getPriceMatic,
    getPriceAmUSDC: _getPriceAmUSDC,
}



