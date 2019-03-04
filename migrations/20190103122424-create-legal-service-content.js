'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('legal_service_contents', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      legal_service_id: {
        type: Sequelize.INTEGER
      },
      legal_service_sub_id: {
        type: Sequelize.INTEGER
      },
      avatar: {
        type: Sequelize.STRING
      },
      content: {
        type: Sequelize.TEXT
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
    return queryInterface.dropTable('legal_service_contents');
  }
};