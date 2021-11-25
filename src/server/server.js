const dotenv = require('dotenv');
dotenv.config();
const cron = require('node-cron');
let debug = require('debug')('server')

const payouts = require('../common/payouts');

const logic = require('./logic');

const express = require('express')
const server = express()
const port = 3000

server.get('/api/total', (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    logic.getTotal().then(value => {
        res.end(JSON.stringify(value));
    }).catch(reason => {
        debug("Error " + reason)
        res.status(400)
        res.end();
    })

});

server.get('/api/load-payouts', (req, res) => {
    debug('API: Load-payouts')
    payouts.loadPayouts();
    res.end();
})


server.get('/api/payouts', (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    logic.getPayouts().then(value => {

        res.end(JSON.stringify(value));

    }).catch(reason => {
        debug("Error: " + reason)
        res.status(400)
        res.end();
    })

});

server.get('/api/prices', (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    logic.getActivePrices().then(value => {
        res.end(JSON.stringify(value));
    }).catch(reason => {
        debug("Error: " + reason)
        res.status(400)
        res.end();
    })
});


server.listen(port, () => {
    debug(`app listening at http://localhost:${port}`)
});


debug('Start Cron')

cron.schedule('00 00 * * *', () => {
    debug('Run cron run payuts');
    logic.runPayouts();
});


// Every hour
cron.schedule('0 * * * *', () => {

    debug('Run cron - load payouts')
    logic.loadPayouts().then(value => {
        debug("Load payouts -> completed")
    }).catch(reason => {
        debug('Load payouts -> Error: '+ reason)
    });

});




