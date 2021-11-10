const axios = require("axios");
const {getDistributionRates} = require("./pushToSheet");


let url = process.env.SHEET_BEST_URL;

const _pushToSheet = (item, tabId) => {

    if (url){
        console.log('Push item to sheet-best: '+ item)
        axios.post(url+'/tabs/' + tabId, item).then(value => {
        }).catch(reason => {
            console.log('Push to sheet error: ' + reason);
        });
    }else {
        console.log('Sheet best url is undefined')
    }
}


const _getInterestRates = ()=>{

    console.log('Get interest rates ')
    return  axios.get(url + '/tabs/Interest Rate - API').then(value => {
        return value.data;
    })
};

const _getDistributionRates = ()=>{
    console.log('Get distribution rates ')
    return  axios.get(url + '/tabs/Distribution Rate - API').then(value => {
        return value.data;
    })
};

const _getPolybor= ()=>{
    console.log('Get polybor')
    return  axios.get(url + '/tabs/Polybor - API').then(value => {
        return value.data;
    })
};


const _getPolyborTable= ()=>{
    console.log('Get polybor table')
    return  axios.get(url + '/tabs/Polybor Talbe - API').then(value => {
        return value.data;
    })
};




module.exports = {
    pushToSheet: _pushToSheet,
    getDistributionRates: _getDistributionRates,
    getInterestRates: _getInterestRates,
    getPolybor: _getPolybor,
    getPolyborTable: _getPolyborTable,
}
