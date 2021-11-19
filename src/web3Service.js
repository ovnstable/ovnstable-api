const fs = require('fs');
const Web3 = require('web3');
const {toFixed} = require("accounting-js");
const dotenv = require('dotenv');
dotenv.config();

let debug = require('debug')('server');
let OverNightToken = JSON.parse(fs.readFileSync('./contracts/OvernightToken.json'));
let Exchange = JSON.parse(fs.readFileSync('./contracts/Exchange.json'));
let M2m = JSON.parse(fs.readFileSync('./contracts/Mark2Market.json'));
let Curve = JSON.parse(fs.readFileSync('./contracts/iCurvePool.json'));
let Gauge = JSON.parse(fs.readFileSync('./contracts/IRewardOnlyGauge.json'));
let IUniswapV2Router02 = JSON.parse(fs.readFileSync('./contracts/IUniswapV2Router02.json'));
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
let uniswapV2Router02 = new web3.eth.Contract(IUniswapV2Router02.abi, '0xa5e0829caced8ffdd4de3c43696c57f7d7a678ff');
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
    swapRouter: uniswapV2Router02,
    uniswapV2Pair: _uniswapV2Pair,
};

function _uniswapV2Pair(...address) {
    return new web3.eth.Contract(IUniswapV2Pair.abi, ...address)
}

function erc20(address) {
    return new web3.eth.Contract(ERC20.abi, address);
}


async function curveTest(amount) {

    console.log(' ')

    // index = 1 = amUSDC

    let priceLp = await curve.methods.get_virtual_price().call() / 10 ** 18;
    console.log('Price lp token: ' + priceLp);
    console.log('Sum amUSDC: ' + amount)
    let newSum = (amount / priceLp)
    console.log('Count am3CRV:' + newSum);

    let ZERO_ETHER = web3.utils.toWei('0', 'ether');
    let fixed = toFixed( newSum * 10 ** 6, 0);
    console.log('Sum after fixed: ' + fixed)
    const amounts = [ZERO_ETHER, fixed, ZERO_ETHER];

    let calcTokenAmount = await curve.methods.calc_token_amount(amounts, true).call();
    console.log('Sum with slippage am3CRV: ' + calcTokenAmount  / 10 ** 18)

    let withdrAmount = await curve.methods.calc_withdraw_one_coin(calcTokenAmount, 1).call();

    let convert = withdrAmount / 10 ** 6
    console.log('Liquidation value amUSDC : ' + convert)

    let number = amount/( calcTokenAmount / 10 ** 18);
    console.log('Liquidation price: ' + number)
    console.log('Liquidation price office: ' + priceLp)
    let priceResult = number - priceLp;
    console.log('Price result: ' + priceResult)

}


async function testValue(){

    let value = 1000000;
    for (let i = 0; i <50 ; i++) {
        await curveTest(value)
        value +=1000000;
    }
}



testValue();
