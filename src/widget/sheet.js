const axios = require("axios");

let debug = require('debug')('server');

let url = process.env.SHEET_BEST_URL;

const _getInterestRates = ()=>{

   debug('Get interest rates ')
    return  axios.get(url + '/tabs/Interest Rate - API').then(value => {
        return value.data;
    })
};

const _getDistributionRates = ()=>{
   debug('Get distribution rates ')
    return  axios.get(url + '/tabs/Distribution Rate - API').then(value => {
        return value.data;
    })
};

const _getPolybor= ()=>{
   debug('Get polybor')
    return  axios.get(url + '/tabs/Polybor - API').then(value => {
        return value.data;
    })
};


const _getPolyborTable= ()=>{
   debug('Get polybor table')
    return  axios.get(url + '/tabs/Polybor Talbe - API').then(value => {
        return value.data;
    })
};



module.exports = {
    getDistributionRates: _getDistributionRates,
    getInterestRates: _getInterestRates,
    getPolybor: _getPolybor,
    getPolyborTable: _getPolyborTable,
}
