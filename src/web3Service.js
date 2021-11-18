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

    console.log('Input sum ' + amount)
    let value = web3.utils.toWei(amount+ '');
    console.log('Input fixed ' + amount)


    let withdrAmount0 = await curve.methods.calc_withdraw_one_coin(value, 0).call();
    let withdrAmount1 = await curve.methods.calc_withdraw_one_coin(value, 1).call();
    let withdrAmount2 = await curve.methods.calc_withdraw_one_coin(value, 2).call();

    let convert = withdrAmount1 / 10 ** 6
    console.log('calc_withdraw_one_coin 0 = ' + withdrAmount0)
    console.log('calc_withdraw_one_coin 1 = ' + convert)
    console.log('calc_withdraw_one_coin 2 = ' + withdrAmount2)

    console.log('PRICE ' + convert / amount)

     console.log(await curve.methods.coins( 0).call());
     console.log(await curve.methods.coins( 1).call());
     console.log(await curve.methods.coins( 2).call());

}


// curveTest(20).then(value => {
//     curveTest(2000).then(value => {
//         curveTest(200000)
//     });
// })
