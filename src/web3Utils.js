const fs = require('fs');
const Web3 = require('web3');
const dotenv = require('dotenv');
dotenv.config();

let debug = require('debug')('server');
let OverNightToken = JSON.parse(fs.readFileSync('./contracts/OvernightToken.json'));
let Exchange = JSON.parse(fs.readFileSync('./contracts/Exchange.json'));
let M2m = JSON.parse(fs.readFileSync('./contracts/Mark2Market.json'));


let web3URL = process.env.WEB3_URL
debug('Web3 URL ' + web3URL)
let web3 = new Web3(web3URL);
web3.eth.net.getId().then(value => {
    debug('Network ID' + value)
});



let ovn = new web3.eth.Contract(OverNightToken.abi, OverNightToken.address);
let m2m = new web3.eth.Contract(M2m.abi, M2m.address);
let exchange = new web3.eth.Contract(Exchange.abi, Exchange.address);


debug('Exchange address: ' + exchange.options.address)
debug('M2m address: ' + m2m.options.address)
debug('Ovn address: ' + ovn.options.address)


module.exports = {
    ovn: ovn,
    m2m: m2m,
    exchange: exchange,
    web3: web3,

};

