
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
const _polyborWeek = () => {

}


module.exports = {
    polybor: _polybor,
    polyborWeek: _polyborWeek,

}
