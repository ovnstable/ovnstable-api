let accounting = require('accounting-js');
let moment = require('moment');
const pushToSheet = require('./pushToSheet.js');
const dataBase = require('./database.js');

let accountingConfig = {
    symbol: "",
    precision: 2,
    thousand: " ",
};


const _polybor = async () => {
    return {
        latest: accounting.formatMoney(11.77, accountingConfig),
        day: accounting.formatMoney(-0.24, accountingConfig),
        week: accounting.formatMoney(-0.26, accountingConfig),
    }
}
const _polyborWeek = async () => {
    return {
        latest: accounting.formatMoney(13.60, accountingConfig),
        day: accounting.formatMoney(-0.05, accountingConfig),
        week: accounting.formatMoney(-4.09, accountingConfig),
    }
}

const _interestRate = async () => {

    return [
        {"date": "22-Oct", "value": 16.58195},
        {"date": "23-Oct", "value": 14.96066},
        {"date": "24-Oct", "value": 18.55103},
        {"date": "25-Oct", "value": 14.32083},
        {"date": "26-Oct", "value": 14.90104},
        {"date": "27-Oct", "value": 16.08059},
        {"date": "28-Oct", "value": 18.04261},
        {"date": "29-Oct", "value": 14.05464},
        {"date": "30-Oct", "value": 19.17116},
        {"date": "31-Oct", "value": 16.31508},
        {"date": "01-Nov", "value": 12.09649},
        {"date": "02-Nov", "value": 12.03231},
        {"date": "03-Nov", "value": 14.15431},
        {"date": "04-Nov", "value": 12.24449},
        {"date": "05-Nov", "value": 9.99716},
        {"date": "06-Nov", "value": 10.70502},
        {"date": "07-Nov", "value": 11.52507},
        {"date": "08-Nov", "value": 12.01926},
        {"date": "09-Nov", "value": 11.77487}
    ]


}

const _distributionRate = async () => {
   return dataBase.getWidgetDistributionRates();
}

const _polyborWeeks = async () => {

    return [
        {
            id: 1,
            label: 'PoLybor Overnight',
            latest: 11.77,
            weekAgo: 12.03,
            high: 19.17,
            low: 10.00,
        },
        {
            id: 2,
            label: 'PoLybor Overnight 1-Week average',
            latest: 13.60,
            weekAgo: 17.68,
            high: 18.97,
            low: 13.60,
        },
    ]
}

const _updateWidgetFromSheet = () =>{

    console.log('Run loading widget data from sheet ')

    pushToSheet.getDistributionRates().then(value => {

        for (let i = 0; i < value.length; i++) {
            let element = value[i];
            element.ovnDist = element.ovnDist.replace(/%/g,"");
            element.normalDist = element.normalDist * 100;
        }

        dataBase.saveWidgetDistributionRates(value);
    });

}


module.exports = {
    polybor: _polybor,
    polyborWeek: _polyborWeek,
    polyborWeeks: _polyborWeeks,
    interestRate: _interestRate,
    distributionRate: _distributionRate,
    updateWidgetFromSheet: _updateWidgetFromSheet,
}


