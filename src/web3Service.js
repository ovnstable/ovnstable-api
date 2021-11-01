const fs = require('fs');
const Web3 = require('web3');

let OverNightToken = JSON.parse(fs.readFileSync('./contracts/OvernightToken.json'));
let Exchange = JSON.parse(fs.readFileSync('./contracts/Exchange.json'));
let M2m = JSON.parse(fs.readFileSync('./contracts/Mark2Market.json'));

let web3URL = process.env.WEB3_URL

let web3 = new Web3(web3URL);
web3.eth.net.getId().then(value => {
    console.log('Network ID' + value)
});


let contract = new web3.eth.Contract(OverNightToken.abi, OverNightToken.networks[137].address);
let M2mContract = new web3.eth.Contract(M2m.abi, M2m.networks[137].address);
let exchange = new web3.eth.Contract(Exchange.abi, Exchange.networks[137].address);


module.exports = {
    ovn: contract,
    m2m: M2mContract,
    exchange: exchange,
    exchangeJSON: Exchange,
    web3: web3
}
