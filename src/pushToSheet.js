const axios = require("axios");


let url = process.env.SHEET_BEST_URL;

const _pushToSheet = (item) => {

    if (url){
        axios.post(url, item).then(value => {
        }).catch(reason => {
            console.log('Push to sheet error: ' + reason);
        });
    }else {
        console.log('Sheet best url is undefined')
    }
}

module.exports = {
    pushToSheet: _pushToSheet
}
