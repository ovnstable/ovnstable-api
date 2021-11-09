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
    return dataBase.getWidgetPolybor().then(value => {
        return {
            latest: accounting.formatMoney(value.latest, accountingConfig),
            day: accounting.formatMoney(value.day, accountingConfig),
            week: accounting.formatMoney(value.week, accountingConfig),
        }
    });
}
const _polyborWeek = async () => {

    return dataBase.getWidgetPolyborWeek().then(value => {
        return {
            latest: accounting.formatMoney(value.latest, accountingConfig),
            day: accounting.formatMoney(value.day, accountingConfig),
            week: accounting.formatMoney(value.week, accountingConfig),
        }
    });
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

    return (await dataBase.getWidgetPolyborWeeksTable()).map(value => {
        return {
            label: value.label,
            latest: value.latest,
            weekAgo: value.weekAgo,
            high: value.high,
            low: value.low,
        }
    });
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

        dataBase.saveWidgetInterestRates(value.reverse()).catch(reason => {
            console.log(reason)
        });

    });


    pushToSheet.getPolyborTable().then(value => {

        for (let i = 0; i < value.length; i++) {
            let element = value[i];
            element.latest = parseFloat(element.latest.replace(/%/g, ""));
            element.weekAgo = parseFloat(element.weekAgo.replace(/%/g, ""));
            element.high = parseFloat(element.high.replace(/%/g, ""));
            element.low = parseFloat(element.low.replace(/%/g, ""));
        }

        dataBase.saveWidgetPolyborWeeksTable(value).catch(reason => {
            console.log(reason)
        });

    });


    pushToSheet.getPolybor().then(value => {

        for (let i = 0; i < value.length; i++) {
            let element = value[i];
            element.latest = parseFloat(element.latest.replace(/%/g, ""));
            element.week= parseFloat(element.week.replace(/%/g, ""));
            element.day = parseFloat(element.day.replace(/%/g, ""));
        }


        let find = value.find(item => item.type === 'polybor');
        dataBase.saveWidgetPolybor([find]).catch(reason => {
            console.log(reason)
        });

        find = value.find(item => item.type === 'polybor-week');
        dataBase.saveWidgetPolyborWeek([find]).catch(reason => {
            console.log(reason)
        })

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


