const EthDater = require('ethereum-block-by-date');
const moment = require("moment");
let debug = require('debug')('m2m');

const payouts = require('./payouts.js');
const mintRedeem = require('./mintRedeem.js');
const googleSheet = require('./pushToSheet.js');


const dataBase = require('./database.js');
const {sequelize} = require("./database");
const {DataTypes, Sequelize} = require("sequelize");

const { getCRV } = require('./anal/CRV.js');
const { getUSDC } = require('./anal/USDC.js');
const { getAmUSDC } = require('./anal/amUSDC.js');
const { getWmatic } = require('./anal/WMATIC.js');
const { getAm3CRVGauge } = require('./anal/Am3CRVGauge.js');
const { getAm3CRV } = require('./anal/Am3CRV.js');


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

        updateM2m(blocks);
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

        updateM2m(blocks)

    });


}

uploadPayouts();

async function updateM2m(blocks){


    getUSDC(blocks).then(value => {
        m2mEntity.bulkCreate(value)
    })

    getAmUSDC(blocks).then(value => {
        m2mEntity.bulkCreate(value)
    })

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


