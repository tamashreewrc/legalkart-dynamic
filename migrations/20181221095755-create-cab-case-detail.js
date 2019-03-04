'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('cab_case_details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      case_id: {
        type: Sequelize.INTEGER
      },
      date_of_assignment: {
        type: Sequelize.DATE
      },
      impound_status: {
        type: Sequelize.STRING
      },
      judge_name: {
        type: Sequelize.STRING
      },
      court_id: {
        type: Sequelize.INTEGER
      },
      driver_name: {
        type: Sequelize.STRING
      },
      driver_mobile: {
        type: Sequelize.STRING
      },
      advocate: {
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
    return queryInterface.dropTable('cab_case_details');
  }
};