let accounting = require('accounting-js');

let accountingConfig = {
    symbol: "",
    precision: 2,
    thousand: " ",
};


const _polybor = async () => {
    return {
        latest: accounting.formatMoney(10, accountingConfig),
        day: accounting.formatMoney(-2.25, accountingConfig),
        week: accounting.formatMoney(4.06, accountingConfig),
    }
}
const _polyborWeek = async () => {
    return {
        latest: accounting.formatMoney(15.84, accountingConfig),
        day: accounting.formatMoney(-1.17, accountingConfig),
        week: accounting.formatMoney(2.94, accountingConfig),
    }
}

const _interestRate = async () => {
    return [
        {
            date: '22-11-2021',
            value: 10.07,
        },
        {
            date: '23-11-2021',
            value: 14.07,
        },
        {
            date: '24-11-2021',
            value: 15.07,
        },
        {
            date: '25-11-2021',
            value: 12.07,
        },
        {
            date: '26-11-2021',
            value: 19.07,
        },
    ]
}

const _distributionRate = async () => {

    return [{"label": "-6%", "normalDist": 0, "ovnDist": 0}, {
        "label": "-4%",
        "normalDist": 0,
        "ovnDist": 0
    }, {"label": "-2%", "normalDist": 0, "ovnDist": 0}, {"label": "0", "normalDist": 0, "ovnDist": 0}, {
        "label": "2%",
        "normalDist": 0.001,
        "ovnDist": 0
    }, {"label": "4%", "normalDist": 0.015, "ovnDist": 0}, {
        "label": "6%",
        "normalDist": 0.20500000000000002,
        "ovnDist": 0
    }, {"label": "8%", "normalDist": 1.636, "ovnDist": 5.88}, {
        "label": "10%",
        "normalDist": 7.477,
        "ovnDist": 11.76
    }, {"label": "12%", "normalDist": 19.57, "ovnDist": 17.65}, {
        "label": "14%",
        "normalDist": 29.348999999999997,
        "ovnDist": 29.41
    }, {"label": "16%", "normalDist": 25.215, "ovnDist": 17.65}, {
        "label": "18%",
        "normalDist": 12.411999999999999,
        "ovnDist": 17.65
    }, {"label": "20%", "normalDist": 3.5000000000000004, "ovnDist": 0}, {
        "label": "22%",
        "normalDist": 0.565,
        "ovnDist": 0
    }, {"label": "24%", "normalDist": 0.052, "ovnDist": 0}, {
        "label": "26%",
        "normalDist": 0.003,
        "ovnDist": 0
    }, {"label": "28%", "normalDist": 0, "ovnDist": 0}]
}


module.exports = {
    polybor: _polybor,
    polyborWeek: _polyborWeek,
    interestRate: _interestRate,
    distributionRate: _distributionRate,

}
