'use strict'
const moment = require('moment')
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SteamGiftsPrice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
    static async create (values, options) {
      try {
        return Promise.resolve(await super.create({
          ...values,
          addedDate: moment().format('YYYY-MM-DD HH:mm:ss')
        }, options))
      } catch (e) {
        return Promise.reject(new Error(`Create SteamGiftsPrice error: ${e}`))
      }
    }
  }

  SteamGiftsPrice.init({
    id: {
      type: DataTypes.BIGINT(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    subId: {
      type: DataTypes.BIGINT(11),
      defaultValue: 0
    },
    subType: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'sub'
    },
    currencyId: {
      type: DataTypes.BIGINT(11)
    },
    countryCode: {
      type: DataTypes.STRING(2)
    },
    price: DataTypes.FLOAT(11, 2),
    priceUsd: DataTypes.FLOAT(11, 2),
    priceInitial: {
      type: DataTypes.FLOAT(11, 2),
      allowNull: false,
      defaultValue: 0
    },
    priceInitialUsd: {
      type: DataTypes.FLOAT(11, 2),
      allowNull: false,
      defaultValue: 0
    },
    addedDate: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'SteamGiftsPrice',
    timestamps: false
  });
  return SteamGiftsPrice
}