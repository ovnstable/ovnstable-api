require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })
console.log('NODE_ENV: ' + process.env.NODE_ENV)
const cron = require('node-cron');
let debug = require('debug')('server')
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




