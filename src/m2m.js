
const EthDater = require('ethereum-block-by-date');
const moment = require("moment");
const axios = require("axios");
let log = require('log');

const payouts = require('./payouts.js');
const mintRedeem = require('./mintRedeem.js');
const web3Service = require('./web3Service.js');
const googleSheet = require('./pushToSheet.js');


const dataBase = require('./database.js');
const {sequelize} = require("./database");
const {DataTypes, Sequelize} = require("sequelize");



const dater = new EthDater(
    web3Service.web3 // Web3 object, required.
);


let m2m = web3Service.curve;
let gauge = web3Service.gauge;
let crvPriceGetter = web3Service.crvPriceGetter;
let wMaticPriceGetter = web3Service.wMaticPriceGetter;
let vault = web3Service.vault;
let a3CrvPriceGetter = web3Service.a3CrvPriceGetter;
let a3CrvGaugePriceGetter = web3Service.a3CrvGaugePriceGetter;
let am3CRV = web3Service.erc20('0xe7a24ef0c5e95ffb0f6684b813a78f2a3ad7d171');
let am3CRVGauge = web3Service.erc20('0xe381c25de995d62b453af8b931aac84fccaa7a62');

let m2mEntity = dataBase.sequelize.define('m2mEntity', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        active: DataTypes.STRING,
        type: DataTypes.STRING,
        value: DataTypes.DECIMAL,
        block: DataTypes.INTEGER,
        position: DataTypes.DECIMAL,
        netAssetValue: DataTypes.DECIMAL,
        liquidationPrice: DataTypes.DECIMAL,
        liquidationValue: DataTypes.DECIMAL,
        marketPrice: DataTypes.DECIMAL,
        date: DataTypes.DATE,
        transactionHash: DataTypes.STRING,
    },
    {
        timestamps: true,
        tableName: 'm2m',
        schema: 'anal',
        underscored: true,
        updatedAt: false,
    }
);


async function getCRV(blocks) {

    let results = [];
    for (let i = 0; i < blocks.length; i++) {
        let item = blocks[i];

        let block = item.block;

        let claimedBefore = await gauge.methods.claimed_reward(vault.options.address, "0x172370d5Cd63279eFa6d502DAB29171933a610AF").call({}, block-1 ) / 10 ** 18
        let claimedAfter = await gauge.methods.claimed_reward(vault.options.address, "0x172370d5Cd63279eFa6d502DAB29171933a610AF").call({}, block+1 ) / 10 ** 18
        let number = claimedAfter - claimedBefore;

        let marketPrice = await crvPriceGetter.methods.getUsdcBuyPrice().call({}, block.block) / 10 ** 18;
        let liquidationPrice = await crvPriceGetter.methods.getUsdcSellPrice().call({}, block.block) / 10 ** 18;


        results.push({
            ...item,
            active: 'CRV',
            position: number,
            block: item.block,
            transactionHash: item.transactionHash,
            date: item.date,
            marketPrice: marketPrice,
            liquidationPrice: liquidationPrice,
            liquidationValue: 0,
            netAssetValue: 0,
        });


    }


    return results

}
async function getWmatic(blocks) {


    let results = [];
    for (let i = 0; i < blocks.length; i++) {
        let item = blocks[i];

        let block = item.block;

        let claimedBefore = await gauge.methods.claimed_reward(vault.options.address, "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270").call({}, block - 1) / 10 ** 18
        let claimedAfter = await gauge.methods.claimed_reward(vault.options.address, "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270").call({}, block + 1) / 10 ** 18
        let number = claimedAfter - claimedBefore;

        let marketPrice = await wMaticPriceGetter.methods.getUsdcBuyPrice().call({}, block.block) / 10 ** 18;
        let liquidationPrice = await wMaticPriceGetter.methods.getUsdcSellPrice().call({}, block.block) / 10 ** 18;

        results.push({
            ...item,
            active: 'WMATIC',
            position: number,
            block: item.block,
            transactionHash: item.transactionHash,
            date: item.date,
            marketPrice: marketPrice,
            liquidationPrice: liquidationPrice,
            liquidationValue: 0,
            netAssetValue: 0,
        });
    }


    return results;
}

async function getAm3CRVGauge(blocks){

    let results = [];

    for (let i = 0; i < blocks.length; i++) {
        let item = blocks[i];

        let price = await a3CrvGaugePriceGetter.methods.getUsdcBuyPrice().call({}, item.block)  / 10 ** 18;
        let positions = await am3CRVGauge.methods.balanceOf(vault.options.address).call({}, item.block) / 10 ** 18;
        results.push({
            ...item,
            active: 'am3CRV-gauge',
            position: positions,
            block: item.block,
            transactionHash: item.transactionHash,
            date: moment(item.date).format('YYYY-MM-DD HH:mm'),
            marketPrice: price,
            liquidationPrice: price,
            liquidationValue: 0,
            netAssetValue: 0,
        });
    }


    return results;
}

async function getAm3CRV(blocks) {

    let results = [];

    for (let i = 0; i < blocks.length; i++) {
        let item = blocks[i];

        let price = await a3CrvPriceGetter.methods.getUsdcBuyPrice().call({}, item.block)  / 10 ** 18;
        let positions = await am3CRV.methods.balanceOf(vault.options.address).call({}, item.block) / 10 ** 18;
        results.push({
            ...item,
            active: 'am3CRV',
            position: positions,
            block: item.block,
            transactionHash: item.transactionHash,
            date: moment(item.date).format('YYYY-MM-DD HH:mm'),
            marketPrice: price,
            liquidationPrice: price,
            liquidationValue: 0,
            netAssetValue: 0,
        });
    }


    return results;
}



async function uploadMintRedeem(){


    mintRedeem.getRecords(1000).then(value => {

        let blocks = [];

        for (let i = 0; i < value.length; i++) {
            let element = value[i];

            blocks.push({
                block: element.block,
                transactionHash: element.transaction_hash,
                date: element.date,
                type: element.type,
                value: element.value,
            })
        }

        getWmatic(blocks).then(value => {
            m2mEntity.bulkCreate(value);
        });

        getCRV(blocks).then(value => {
            m2mEntity.bulkCreate(value)
        });

        getAm3CRVGauge(blocks).then(value => {
            m2mEntity.bulkCreate(value);
        });

        getAm3CRV(blocks).then(value => {
            m2mEntity.bulkCreate(value);
        });
    })
}

async function uploadPayouts(){

    payouts.getPayouts(100).then(value => {

        let blocks = [];

        for (let i = 0; i < value.length; i++) {
            let element = value[i];

            blocks.push({
                block: element.block,
                transactionHash: element.transaction_hash,
                date: element.payable_date,
                type: 'PAYOUT',
                value: element.total_ovn,
            })
        }

        getWmatic(blocks).then(value => {
            m2mEntity.bulkCreate(value);
        });

        getCRV(blocks).then(value => {
            m2mEntity.bulkCreate(value)
        });

        getAm3CRVGauge(blocks).then(value => {
            m2mEntity.bulkCreate(value);
        });

        getAm3CRV(blocks).then(value => {
            m2mEntity.bulkCreate(value);
        });

    });


}


async function pushToSheet(){

    sequelize.query(`select * from anal.m2m order by date desc`).then(value => {

        let array = value[0];
        for (let i = 0; i <array.length; i++) {
            let item = array[i];
            item.date = moment.utc(new Date(item.date.toString().slice(0, 24))).format('MM/DD/YYYY HH:mm:ss');
        }

        googleSheet.pushToSheet(array, 'M2M API')
    })

}


