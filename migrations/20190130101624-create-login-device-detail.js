'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('login_device_details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      ip_address: {
        type: Sequelize.STRING
      },
      platform: {
        type: Sequelize.STRING
      },
      device_cordova: {
        type: Sequelize.STRING
      },
      device_model: {
        type: Sequelize.STRING
      },
      device_platform: {
        type: Sequelize.STRING
      },
      device_uuid: {
        type: Sequelize.STRING
      },
      device_version: {
        type: Sequelize.STRING
      },
      device_manufacturer: {
        type: Sequelize.STRING
      },
      device_isvirtual: {
        type: Sequelize.STRING
      },
      device_serial: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
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
    return queryInterface.dropTable('login_device_details');
  }
};