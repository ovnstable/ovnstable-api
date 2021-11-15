const dotenv = require('dotenv');
dotenv.config();

const moment = require("moment");
let debug = require('debug')('m2m');

const payouts = require('./payouts.js');
const mintRedeem = require('./mintRedeem.js');
const googleSheet = require('./pushToSheet.js');


const dataBase = require('./database.js');
const {sequelize} = require("./database");
const {DataTypes, Sequelize} = require("sequelize");

const {getCRV} = require('./anal/CRV.js');
const {getUSDC} = require('./anal/USDC.js');
const {getAmUSDC} = require('./anal/amUSDC.js');
const {getWmatic} = require('./anal/WMATIC.js');
const {getAm3CRVGauge} = require('./anal/Am3CRVGauge.js');
const {getAm3CRV} = require('./anal/Am3CRV.js');
const {getOVN} = require('./anal/OVN.js');


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
        fee: DataTypes.DECIMAL,
    },
    {
        timestamps: true,
        tableName: 'm2m',
        schema: 'anal',
        underscored: true,
        updatedAt: false,
    }
);


async function uploadMintRedeem() {

    mintRedeem.getRecords(1000).then(value => {

        let blocks = [];

        for (let i = 0; i < value.length; i++) {
            let element = value[i];

            blocks.push({
                block: element.block-1,
                transactionHash: element.transaction_hash,
                date: element.date,
                type: element.type + " BEFORE",
                value: element.value,
                fee: element.fee,
            });


            blocks.push({
                block: element.block,
                transactionHash: element.transaction_hash,
                date: element.date,
                type: element.type + " AFTER",
                value: element.value,
                fee: element.fee
            })
        }

        updateM2m(blocks);
    })
}

async function uploadPayouts() {

    return payouts.getPayouts(100).then(value => {

        let blocks = [];

        for (let i = 0; i < value.length; i++) {
            let element = value[i];

            blocks.push({
                block: element.block-1,
                transactionHash: element.transaction_hash,
                date: element.payable_date,
                type: 'PAYOUT BEFORE',
                value: element.totally_amount_rewarded,
                fee: 0,
            });

            blocks.push({
                block: element.block,
                transactionHash: element.transaction_hash,
                date: element.payable_date,
                type: 'PAYOUT AFTER',
                value: element.totally_amount_rewarded,
                fee: 0,
            })
        }

        return updateM2m(blocks)

    });


}


async function recreateM2m() {

    debug('recreate m2m')

    // await payouts.loadPayouts();
    // await mintRedeem.loadRecords();

    await uploadMintRedeem();
    uploadPayouts().then(value => {
        debug('Push m2m to sheet')
        pushToSheet();
    })
}


recreateM2m();

async function updateM2m(blocks) {


    let promises = [];
    promises.push(getUSDC(blocks).then(value => {
        return m2mEntity.bulkCreate(value)
    }));

    promises.push(getAmUSDC(blocks).then(value => {
        return m2mEntity.bulkCreate(value)
    }))

    promises.push(getWmatic(blocks).then(value => {
        return m2mEntity.bulkCreate(value);
    }));

    promises.push(getCRV(blocks).then(value => {
        return m2mEntity.bulkCreate(value)
    }));

    promises.push(getAm3CRVGauge(blocks).then(value => {
        return m2mEntity.bulkCreate(value);
    }));

    promises.push(getAm3CRV(blocks).then(value => {
        return m2mEntity.bulkCreate(value);
    }));

    promises.push(getOVN(blocks).then(value => {
        return m2mEntity.bulkCreate(value);
    }));

    return Promise.all(promises);
}


async function pushToSheet() {

    sequelize.query(`select *
                     from anal.m2m
                     order by date desc`).then(value => {

        let array = value[0];
        for (let i = 0; i < array.length; i++) {
            let item = array[i];
            item.date = moment.utc(new Date(item.date.toString().slice(0, 24))).format('MM/DD/YYYY HH:mm:ss');
        }

        googleSheet.pushToSheetM2M(array, 'M2M - API')
    })

}


