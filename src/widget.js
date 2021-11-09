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
    return (await dataBase.getWidgetInterestRates()).map(value => {

        return {
            date: value.date,
            value: value.value,
        }
    });

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

const _updateWidgetFromSheet = () => {

    console.log('Run loading widget data from sheet ')


    pushToSheet.getDistributionRates().then(value => {

        for (let i = 0; i < value.length; i++) {
            let element = value[i];
            element.ovnDist = element.ovnDist.replace(/%/g,"");
            element.normalDist = element.normalDist * 100;
        }

        dataBase.saveWidgetDistributionRates(value).catch(reason => {
            console.log(reason)
        });
    });


    pushToSheet.getInterestRates().then(value => {

        for (let i = 0; i < value.length; i++) {
            let element = value[i];
            element.value = parseFloat(element.value.replace(/%/g, ""));
        }

        dataBase.saveWidgetInterestRates(value).catch(reason => {
            console.log(reason)
        });

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


