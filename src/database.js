const {Sequelize, DataTypes} = require('sequelize');


let url = process.env.POSTGRES_CONNECT_URL;
if (!url)
    url= 'postgres://ovn_user:ovn_password@localhost:5432/ovn_analytics'

console.log('Connect url: ' + url)
const sequelize = new Sequelize(url)

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
        sender: DataTypes.STRING,
        balanceOvn: DataTypes.DECIMAL,
        transactionHash: DataTypes.STRING,
    },
    {
        timestamps: true,
        tableName: 'asset_prices_for_balance',
        underscored: true,
    }
);


let distributionRateEntity = sequelize.define('WidgetDistributionRate', {
        label: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true
        },
        normalDist: DataTypes.DECIMAL,
        ovnDist: DataTypes.DECIMAL,
    },
    {
        timestamps: true,
        tableName: 'distribution_rate',
        schema: 'widget',
        underscored: true,
    }
);


const saveToDatabase = (item) => {
    asset.create(item);
}


const  _saveWidgetDistributionRates = (items) => {

    distributionRateEntity.destroy({
        where: {},
        truncate: true
    });

    distributionRateEntity.bulkCreate(items);
}

const _getWidgetDistributionRates = () => {
    return distributionRateEntity.findAll();
};

module.exports = {
   save: saveToDatabase,
    saveWidgetDistributionRates: _saveWidgetDistributionRates,
    getWidgetDistributionRates: _getWidgetDistributionRates,
}




