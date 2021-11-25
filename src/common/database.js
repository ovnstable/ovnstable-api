const {Sequelize} = require('sequelize');
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


module.exports = {
    sequelize: sequelize,
}




