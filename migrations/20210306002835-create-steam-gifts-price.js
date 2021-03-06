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
        defaultValue: 0
      },
      subType: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'sub'
      },
      currencyId: {
        type: Sequelize.BIGINT(11)
      },
      countryCode: {
        type: Sequelize.STRING(2)
      },
      price: Sequelize.FLOAT,
      priceUsed: Sequelize.FLOAT,
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
        type: Sequelize.DATE(6)
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('SteamGiftsPrices');
  }
};