const {Sequelize, DataTypes} = require('sequelize');


const sequelize = new Sequelize('postgres://ovn_user:ovn_password@localhost:5432/ovn_analytics')

try {
    sequelize.authenticate().then(value => {
        console.log('Соединение с БД было успешно установлено')
    })
} catch (e) {
    console.log('Невозможно выполнить подключение к БД: ', e)
}


let asset = sequelize.define('Asset', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        active: DataTypes.STRING,
        activeName: DataTypes.STRING,
        position: DataTypes.DECIMAL,
        marketPrice: DataTypes.DECIMAL,
        netAssetValue: DataTypes.DECIMAL,
        liquidationPrice: DataTypes.DECIMAL,
        liquidationValue: DataTypes.DECIMAL,
        type: DataTypes.STRING,
        amount: DataTypes.DECIMAL,
        amountFee: DataTypes.DECIMAL,
        sender: DataTypes.STRING
    },
    {
        timestamps: true,
        tableName: 'asset_prices_for_balance',
        underscored: true,
    }
);


const saveToDatabase = (item) => {
    asset.create(item);
}
module.exports = {
   save: saveToDatabase
}



