const axios = require('axios');
let debug = require('debug')('server');

const web3Service = require('./web3Service');
const fs = require("fs");
const moment = require("moment");
const {toFixed} = require("accounting-js");
const {pushToSheet} = require("./pushToSheet");
const {sequelize} = require("./database");
const { DataTypes} = require("sequelize");

let payoutEntity = sequelize.define('PayoutEntity', {
        transactionHash: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
        block: DataTypes.INTEGER,
        payableDate: DataTypes.DATE,
        totalOvn: DataTypes.DECIMAL,
        totalUsdc: DataTypes.DECIMAL,
        totallyAmountRewarded: DataTypes.DECIMAL,
        totallySaved: DataTypes.DECIMAL,
        dailyProfit: DataTypes.DECIMAL,
        elapsedTime: DataTypes.DECIMAL,
        annualizedYield: DataTypes.DECIMAL,
        sender: DataTypes.STRING,

    },
    {
        timestamps: true,
        tableName: 'payouts',
        schema: 'anal',
        underscored: true,
        updatedAt: false,
    }
);


let rewardEvent = web3Service.exchangeJSON.abi.find(value => value.name === 'RewardEvent');
let lastDateFromPayouts;

async function getItems() {

    let query = await sequelize.query("select * from anal.payouts order by block desc limit 1");

    let API_KEY = 'ckey_3a2959d0ef4b489ea62c0473214';
    let topic = rewardEvent.signature;

    let startBlock;
    if (query[0][0]) {
        startBlock = query[0][0].block + 1;
        lastDateFromPayouts = moment.utc(new Date(query[0][0].payable_date.toString().slice(0, 24)));
        ;
    } else {
        startBlock = 20432146;
    }
    let endBlock = await web3Service.web3.eth.getBlockNumber();
    let url = `https://api.covalenthq.com/v1/137/events/topics/${topic}/\?starting-block\=${startBlock}\&ending-block\=${endBlock}\&key\=${API_KEY}`

    let items = await axios.get(url).then(value => {
        return value.data.data.items;
    }).catch(reason => {
        debug(reason);
        throw 'Не удалось выгрузить данные';
    });

    return items;
}




function addToSheet(items){
    if (items.length > 0) {
        let results = [];
        items.forEach(value => {

            let item = {
                payableDate: value.payableDate.format('MM/DD/YYYY HH:mm:ss'),
                dailyProfit: value.dailyProfit,
                elapsedTime: value.elapsedTime,
                annualizedYield: value.annualizedYield
            };
            results.push(item)
        })

        return pushToSheet(results, 'Data API')
    }else{
        return Promise.resolve();
    }
}



const getRewardEvent = (items) => {

    let result = [];

    let lastDate = null;

    items.forEach((item) => {


        let parameters = web3Service.web3.eth.abi.decodeParameters(rewardEvent.inputs, item.raw_log_data);

        let log = {};

        log.block = item.block_height;
        log.transactionHash = item.tx_hash;
        log.payableDate = moment.utc(item.block_signed_at);
        log.sender = item.sender_address;
        log.totalOvn = parameters.totalOvn / 10 ** 6;
        log.totalUsdc = parameters.totalUsdc / 10 ** 6;
        log.totallyAmountRewarded = parameters.totallyAmountRewarded / 10 ** 6;
        log.totallySaved = parameters.totallySaved / 10 ** 6;
        log.dailyProfit = Number.parseFloat(toFixed(log.totallyAmountRewarded / log.totalOvn, 6));

        if (items.length === 1){
            lastDate = lastDateFromPayouts;
        }

        if (lastDate) {
            log.elapsedTime = Number.parseFloat(diff_hours(log.payableDate, lastDate));
        }

        lastDate = log.payableDate;

        if (log.elapsedTime)
            log.annualizedYield = (((log.dailyProfit / log.elapsedTime + 1) ** (365 * 24) - 1)) * 100;


        result.push(log)
    })

    return result;
}

function diff_hours(dt2, dt1) {
    let duration = moment.duration(moment.utc(dt2).diff(moment.utc(dt1)));
    return duration.asHours();
}


function _loadItems(){
    return getItems().then(value => {

        let items = getRewardEvent(value);

        return payoutEntity.bulkCreate(items).then(()=> {
            if (items.length > 0){
                return addToSheet(items).then(() => Promise.resolve(true))
            }else {
                return Promise.resolve(false);
            }
        }).catch(reason => {
            debug(reason);

        });
    })

}

function _getPayouts(limit){
    return sequelize.query(`select * from anal.payouts order by block desc limit ${limit}`).then(value => {

        let array = value[0];

        if (array){
            for (let i = 0; i <array.length ; i++) {
                let element = array[i];
                element.payable_date = moment.utc(new Date(element.payable_date.toString().slice(0, 24)))
            }
        }

        return array;
    });
}

module.exports = {
    loadPayouts: _loadItems,
    getPayouts: _getPayouts,
}
