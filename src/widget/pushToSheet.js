const axios = require("axios");

let debug = require('debug')('server');

let url = process.env.SHEET_BEST_URL;
let m2mUrl = process.env.M2M_SHEET_BEST_URL;

const _pushToSheet = (item, tabId) => {

    if (url){
       debug('Push item to sheet-best: '+ item)
        axios.post(url+'/tabs/' + tabId, item).then(value => {
        }).catch(reason => {
           debug('Push to sheet error: ' + reason);
        });
    }else {
       debug('Sheet best url is undefined')
    }
}

const _pushToSheetM2M = (item, tabId) => {

    if (m2mUrl){
        debug('Push item to sheet-best: '+ item)
        axios.post(m2mUrl+'/tabs/' + tabId, item).then(value => {
        }).catch(reason => {
            debug('Push to sheet error: ' + reason);
        });
    }else {
        debug('Sheet best url is undefined')
    }
}


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
    pushToSheet: _pushToSheet,
    pushToSheetM2M: _pushToSheetM2M,
    getDistributionRates: _getDistributionRates,
    getInterestRates: _getInterestRates,
    getPolybor: _getPolybor,
    getPolyborTable: _getPolyborTable,
}
