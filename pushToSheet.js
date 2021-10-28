const axios = require("axios");


const _pushToSheet = (item) => {

    axios.post('https://sheet.best/api/sheets/09902320-b5ca-4a18-abac-7c7238002f57', item).then(value => {
        console.log('Push to sheet response: ' + JSON.stringify(value.data))
    }).catch(reason => {
        console.log('Push to sheet error: ' + reason);
    });
}



module.exports = {
    pushToSheet: _pushToSheet
}
