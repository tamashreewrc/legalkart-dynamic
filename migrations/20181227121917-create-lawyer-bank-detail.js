'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('lawyer_bank_details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      lawyer_id: {
        type: Sequelize.INTEGER
      },
      account_number: {
        type: Sequelize.STRING
      },
      ifsc_code: {
        type: Sequelize.STRING
      },
      bank_name: {
        type: Sequelize.STRING
      },
      account_holder: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('lawyer_bank_details');
  }
};