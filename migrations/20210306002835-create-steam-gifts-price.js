'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SteamGiftsPrices', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT(11)
      },
      subId: {
        type: Sequelize.BIGINT(11),
        defaultValue: 0,
        unique: 'compositeIndex'
      },
      subType: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'sub'
      },
      currencyId: {
        type: Sequelize.BIGINT(11),
        unique: 'compositeIndex'
      },
      countryCode: {
        type: Sequelize.STRING(2),
        unique: 'compositeIndex'
      },
      price: Sequelize.FLOAT,
      priceUsd: Sequelize.FLOAT,
      priceInitial: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      priceInitialUsd: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      addedDate: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
      .then(() => queryInterface.addIndex('SteamGiftsPrices', ['subId', 'currencyId', 'countryCode']))
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('SteamGiftsPrices');
  }
};