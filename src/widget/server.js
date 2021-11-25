const dotenv = require('dotenv');
dotenv.config();
let debug = require('debug')('server')

const widget = require('./logic.js')


const express = require('express')
const cron = require("node-cron");
const server = express()
const port = 3000

server.get('/api/update-widgets', (req, res) => {
    debug('API: Update widgets')
    widget.updateWidgetFromSheet();
    res.end();
})

server.get('/api/widget/:widgetId', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    let widgetId = req.params.widgetId;
    switch (widgetId) {
        case 'polybor':
            widget.polybor().then(value => {
                res.end(JSON.stringify(value));
            });
            break;
        case 'polybor-week':
            widget.polyborWeek().then(value => {
                res.end(JSON.stringify(value));
            });
            break;
        case 'polybor-weeks':
            widget.polyborWeeks().then(value => {
                res.end(JSON.stringify(value));
            });
            break;
        case 'interest-rate':
            widget.interestRate().then(value => {
                res.end(JSON.stringify(value));
            });
            break;
        case 'distribution-rate':
            widget.distributionRate().then(value => {
                res.end(JSON.stringify(value));
            });
            break;


        default:
            debug('Unknown widget id ' + widgetId)
    }


});

server.listen(port, () => {
    debug(`app listening at http://localhost:${port}`)
});

cron.schedule('0 * * * *', () => {
    debug('Cron start: Update Widget from Sheet')
    try {
        widget.updateWidgetFromSheet();
    } catch (e) {
        debug("Error Update Widget from Sheet': " + e)
    }
})
