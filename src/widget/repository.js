const {Sequelize, DataTypes} = require('sequelize');
let debug = require('debug')('server');
const {sequelize} = require('../common/database.js')


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

let polyborEntity = sequelize.define('WidgetPolybor', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        latest: DataTypes.DECIMAL,
        day: DataTypes.DECIMAL,
        week: DataTypes.DECIMAL,
    },
    {
        timestamps: true,
        tableName: 'polybor',
        schema: 'widget',
        underscored: true,
    }
);

let polyborWeekEntity = sequelize.define('WidgetPolyborWeek', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        latest: DataTypes.DECIMAL,
        day: DataTypes.DECIMAL,
        week: DataTypes.DECIMAL,
    },
    {
        timestamps: true,
        tableName: 'polybor_week',
        schema: 'widget',
        underscored: true,
    }
);

let polyborWeeksEntity = sequelize.define('WidgetPolyborWeeksTable', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        label: DataTypes.STRING,
        latest: DataTypes.DECIMAL,
        weekAgo: DataTypes.DECIMAL,
        high: DataTypes.DECIMAL,
        low: DataTypes.DECIMAL,
    },
    {
        timestamps: true,
        tableName: 'polybor_weeks_table',
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

const  _saveWidgetPolybor = (items) => {
    return polyborEntity.destroy({
        where: {},
        truncate: true
    }).then(value => {
        return polyborEntity.bulkCreate(items);
    });
}

const  _saveWidgetPolyborWeek = (items) => {
    return polyborWeekEntity.destroy({
        where: {},
        truncate: true
    }).then(value => {
        return polyborWeekEntity.bulkCreate(items);
    });
}

const  _saveWidgetPolyborWeeksTable = (items) => {
    return polyborWeeksEntity.destroy({
        where: {},
        truncate: true
    }).then(value => {
        return polyborWeeksEntity.bulkCreate(items);
    });
}


module.exports = {
    saveWidgetDistributionRates: _saveWidgetDistributionRates,
    saveWidgetInterestRates: _saveWidgetInterestRates,
    saveWidgetPolybor: _saveWidgetPolybor,
    saveWidgetPolyborWeek: _saveWidgetPolyborWeek,
    saveWidgetPolyborWeeksTable: _saveWidgetPolyborWeeksTable,

    getWidgetDistributionRates: ()=>distributionRateEntity.findAll(),
    getWidgetInterestRates: ()=> interestRateEntity.findAll(),
    getWidgetPolybor: ()=> polyborEntity.findOne(),
    getWidgetPolyborWeek: ()=> polyborWeekEntity.findOne(),
    getWidgetPolyborWeeksTable: ()=> polyborWeeksEntity.findAll(),
}




