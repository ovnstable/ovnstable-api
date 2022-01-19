const {Sequelize} = require('sequelize');
const moment = require("moment");
let debug = require('debug')('server');

let url = process.env.POSTGRES_CONNECT_URL;
if (!url)
    url= 'postgres://postgres:@localhost:5432/ovn_analytics'

debug('Connect url: ' + url)
const sequelize = new Sequelize(url)

try {
    sequelize.authenticate().then(value => {
       debug('Соединение с БД было успешно установлено')
    })
} catch (e) {
   debug('Невозможно выполнить подключение к БД: ', e)
}


function _getPayouts(limit) {
    return sequelize.query(`select *
                            from anal.payouts
                            order by date desc
                            limit ${limit}`).then(value => {

        let array = value[0];

        if (array) {
            for (let i = 0; i < array.length; i++) {
                let element = array[i];
                element.payable_date = moment.utc(new Date(element.date.toString().slice(0, 24)))
            }
        }

        return array;
    });
}


module.exports = {
    sequelize: sequelize,
    getPayouts: _getPayouts,

}




