const axios = require('axios');
let debug = require('debug')('server');

const web3Service = require('./web3Service');
const moment = require("moment");
const {toFixed} = require("accounting-js");
const {pushToSheet} = require("./pushToSheet");
const {sequelize} = require("./database");
const { DataTypes} = require("sequelize");

let covalentApiKey = process.env.COVALENT_API_KEY;

let mintRedeemEntity = sequelize.define('MintRedeemEntity', {
        transactionHash: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
        date: DataTypes.DATE,
        block: DataTypes.INTEGER,
        value: DataTypes.DECIMAL,
        sender: DataTypes.STRING,
        type: DataTypes.STRING,
        fee: DataTypes.DECIMAL,
    },
    {
        timestamps: true,
        tableName: 'mint_redeem',
        schema: 'anal',
        underscored: true,
        updatedAt: false,
    }
);


let eventExchange = web3Service.exchangeJSON.abi.find(value => value.name === 'EventExchange');
let lastDateFromPayouts;

async function getItems() {

    let query = await sequelize.query("select * from anal.mint_redeem order by block desc limit 1");

    let topic = eventExchange.signature;
    let startBlock;
    if (query[0][0]) {
        startBlock = query[0][0].block + 1;
        lastDateFromPayouts = moment.utc(new Date(query[0][0].date.toString().slice(0, 24)));
    } else {
        startBlock = 20432146;
    }


    let million = 1000000;
    let lastBlock = startBlock + million;
    let endBlock = await web3Service.web3.eth.getBlockNumber();

    let results = [];
    while (lastBlock !== endBlock) {


        let list = await getData(topic, startBlock, lastBlock);
        results.push(...list)

        startBlock = lastBlock + 1;
        lastBlock = lastBlock + million;
        if (lastBlock > endBlock){
            lastBlock = endBlock;
            let list = await getData(topic, startBlock, lastBlock);
            results.push(...list)
        }
    }

    debug('Count mint/Redeems ' + results.length)
    return results;
}


async function getData(topic, startBlock, lastBlock){
    let url = `https://api.covalenthq.com/v1/137/events/topics/${topic}/\?starting-block\=${startBlock}\&ending-block\=${lastBlock}\&key\=${covalentApiKey}`

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

        pushToSheet(results, 'Data API')

    }
}



const getMintRedeemEvents = (items) => {

    let result = [];

    items.forEach((item) => {


        let parameters = web3Service.web3.eth.abi.decodeParameters(eventExchange.inputs, item.raw_log_data);

        let log = {};

        log.block = item.block_height;
        log.transactionHash = item.tx_hash;
        log.date = moment.utc(item.block_signed_at);
        log.sender = parameters.sender;

        if (parameters.label === 'buy')
            log.type = 'MINT';
        else if (parameters.label === 'redeem')
            log.type = 'REDEEM';
        else
            throw 'Unknown type ' + parameters.label;

        log.value = parameters.amount / 10 ** 6;
        log.fee = parameters.fee / 10 ** 6;

        result.push(log)
    })

    return result;
}



function _loadItems(){
    return getItems().then(value => {

        let items = getMintRedeemEvents(value);

        return mintRedeemEntity.bulkCreate(items).catch(reason => {
            debug(reason)
        });
    });

}

function _getRecords(limit){
    return sequelize.query(`select * from anal.mint_redeem order by block desc limit ${limit}`).then(value => {

        let array = value[0];

        if (array){
            for (let i = 0; i <array.length ; i++) {
                let element = array[i];
                element.date = moment.utc(new Date(element.date.toString().slice(0, 24)))
            }
        }

        return array;
    });
}

module.exports = {
    loadRecords: _loadItems,
    getRecords: _getRecords,
}
