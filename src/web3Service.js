const fs = require('fs');
const Web3 = require('web3');
let debug = require('debug')('server');
let OverNightToken = JSON.parse(fs.readFileSync('./contracts/OvernightToken.json'));
let Exchange = JSON.parse(fs.readFileSync('./contracts/Exchange.json'));
let M2m = JSON.parse(fs.readFileSync('./contracts/Mark2Market.json'));
let Curve = JSON.parse(fs.readFileSync('./contracts/iCurvePool.json'));
let Gauge = JSON.parse(fs.readFileSync('./contracts/IRewardOnlyGauge.json'));
let Vault = JSON.parse(fs.readFileSync('./contracts/Vault.json'));
let WMaticPriceGetter = JSON.parse(fs.readFileSync('./contracts/WMaticPriceGetter.json'));
let IUniswapV2Pair = JSON.parse(fs.readFileSync('./contracts/IUniswapV2Pair.json'));
let CrvPriceGetter = JSON.parse(fs.readFileSync('./contracts/CrvPriceGetter.json'));
let A3CrvPriceGetter = JSON.parse(fs.readFileSync('./contracts/A3CrvPriceGetter.json'));
let A3CrvGaugePriceGetter = JSON.parse(fs.readFileSync('./contracts/A3CrvGaugePriceGetter.json'));
let ERC20 = JSON.parse(fs.readFileSync('./contracts/ERC20.json'));

let web3URL = process.env.WEB3_URL
debug('Web3 URL ' + web3URL)
let web3 = new Web3(web3URL);
web3.eth.net.getId().then(value => {
    debug('Network ID' + value)
});


let ovn = new web3.eth.Contract(OverNightToken.abi, OverNightToken.networks[137].address);
let m2m = new web3.eth.Contract(M2m.abi, M2m.networks[137].address);
let exchange = new web3.eth.Contract(Exchange.abi, Exchange.networks[137].address);

let curve = new web3.eth.Contract(Curve.abi, '0x445FE580eF8d70FF569aB36e80c647af338db351');
let wMaticPriceGetter = new web3.eth.Contract(WMaticPriceGetter.abi, WMaticPriceGetter.networks[137].address);
let crvPriceGetter = new web3.eth.Contract(CrvPriceGetter.abi, CrvPriceGetter.networks[137].address);
let gauge = new web3.eth.Contract(Gauge.abi, '0x19793B454D3AfC7b454F206Ffe95aDE26cA6912c');
let vault = new web3.eth.Contract(Vault.abi, Vault.networks[137].address)
let a3CrvPriceGetter = new web3.eth.Contract(A3CrvPriceGetter.abi, A3CrvPriceGetter.networks[137].address)
let a3CrvGaugePriceGetter = new web3.eth.Contract(A3CrvGaugePriceGetter.abi, A3CrvGaugePriceGetter.networks[137].address)

debug('Exchange address: ' + exchange.options.address)
debug('M2m address: ' + m2m.options.address)
debug('Ovn address: ' + ovn.options.address)


module.exports = {
    ovn: ovn,
    m2m: m2m,
    exchange: exchange,
    exchangeJSON: Exchange,
    web3: web3,
    curve: curve,
    wMaticPriceGetter: wMaticPriceGetter,
    crvPriceGetter: crvPriceGetter,
    gauge: gauge,
    vault: vault,
    a3CrvPriceGetter: a3CrvPriceGetter,
    a3CrvGaugePriceGetter: a3CrvGaugePriceGetter,
    erc20: erc20,
    uniswapV2Pair: _uniswapV2Pair,
};

function _uniswapV2Pair(...address){
    return  new web3.eth.Contract(IUniswapV2Pair.abi, ...address)
}

function erc20(address){
    return new web3.eth.Contract(ERC20.abi, address);
}


// let pairCRV = _uniswapV2Pair( '0x172370d5Cd63279eFa6d502DAB29171933a610AF', '0x2791bca1f2de4661ed88a30c99a7a9449aa84174');
//
//
// pairCRV.methods.getReserves().call().then(value => {
//     console.log(value)
// }).catch(reason => {
//     console.log(reason)
// })

