let accounting = require('accounting-js');
const sheet = require('./sheet.js');
const repository = require('./repository.js');
let debug = require('debug')('server');


let accountingConfig = {
    symbol: "",
    precision: 2,
    thousand: " ",
};


const _polybor = async () => {
    return repository.getWidgetPolybor().then(value => {
        return {
            latest: accounting.formatMoney(value.latest, accountingConfig),
            day: accounting.formatMoney(value.day, accountingConfig),
            week: accounting.formatMoney(value.week, accountingConfig),
        }
    });
}
const _polyborWeek = async () => {

    return repository.getWidgetPolyborWeek().then(value => {
        return {
            latest: accounting.formatMoney(value.latest, accountingConfig),
            day: accounting.formatMoney(value.day, accountingConfig),
            week: accounting.formatMoney(value.week, accountingConfig),
        }
    });
}

const _interestRate = async () => {
    return (await repository.getWidgetInterestRates()).map(value => {
        return {
            date: value.date,
            value: value.value,
        }
    });

}

const _distributionRate = async () => {
    return repository.getWidgetDistributionRates();
}

const _polyborWeeks = async () => {

    return (await repository.getWidgetPolyborWeeksTable()).map(value => {
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

    debug('Run loading widget data from sheet ')


    sheet.getDistributionRates().then(value => {

        for (let i = 0; i < value.length; i++) {
            let element = value[i];
            element.ovnDist = element.ovnDist.replace(/%/g,"");
            element.normalDist = element.normalDist * 100;
        }

        repository.saveWidgetDistributionRates(value).catch(reason => {
            debug(reason)
        });
    });


    sheet.getInterestRates().then(value => {

        let results = [];
        for (let i = 0; i < value.length; i++) {
            let element = value[i];

            if (element.value){
                element.value = parseFloat(element.value.replace(/%/g, ""));
                results.push(element);
            }
        }

        repository.saveWidgetInterestRates(results.reverse()).catch(reason => {
            debug(reason)
        });

    });


    sheet.getPolyborTable().then(value => {

        for (let i = 0; i < value.length; i++) {
            let element = value[i];
            element.latest = parseFloat(element.latest.replace(/%/g, ""));
            element.weekAgo = parseFloat(element.weekAgo.replace(/%/g, ""));
            element.high = parseFloat(element.high.replace(/%/g, ""));
            element.low = parseFloat(element.low.replace(/%/g, ""));
        }

        repository.saveWidgetPolyborWeeksTable(value).catch(reason => {
            debug(reason)
        });

    });


    sheet.getPolybor().then(value => {

        for (let i = 0; i < value.length; i++) {
            let element = value[i];
            element.latest = parseFloat(element.latest.replace(/%/g, ""));
            element.week= parseFloat(element.week.replace(/%/g, ""));
            element.day = parseFloat(element.day.replace(/%/g, ""));
        }


        let find = value.find(item => item.type === 'polybor');
        repository.saveWidgetPolybor([find]).catch(reason => {
            debug(reason)
        });

        find = value.find(item => item.type === 'polybor-week');
        repository.saveWidgetPolyborWeek([find]).catch(reason => {
            debug(reason)
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


