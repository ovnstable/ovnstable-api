const {Sequelize, DataTypes} = require('sequelize');


let url = process.env.POSTGRES_CONNECT_URL;
if (!url)
    url= 'postgres://postgres:@localhost:5432/ovn_analytics'

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



let interestRateEntity = sequelize.define('WidgetInterestRate', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        value: DataTypes.DECIMAL,
        date: DataTypes.STRING,
    },
    {
        timestamps: true,
        tableName: 'interest_rate',
        schema: 'widget',
        underscored: true,
    }
);


const  _saveWidgetDistributionRates = (items) => {
    return distributionRateEntity.destroy({
        where: {},
        truncate: true
    }).then(value => {
        return distributionRateEntity.bulkCreate(items);
    });
}

const  _saveWidgetInterestRates = (items) => {
    return interestRateEntity.destroy({
        where: {},
        truncate: true
    }).then(value => {
        return interestRateEntity.bulkCreate(items);
    });
}



module.exports = {
    saveWidgetDistributionRates: _saveWidgetDistributionRates,
    saveWidgetInterestRates: _saveWidgetInterestRates,
    getWidgetDistributionRates: ()=>distributionRateEntity.findAll(),
    getWidgetInterestRates: ()=> interestRateEntity.findAll(),
}




