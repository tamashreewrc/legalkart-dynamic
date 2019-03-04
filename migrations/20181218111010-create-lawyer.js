'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('lawyers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      lawyer_id: {
        type: Sequelize.INTEGER
      },
      court_id: {
        type: Sequelize.INTEGER
      },
      practice_area_id: {
        type: Sequelize.INTEGER
      },
      sub_practice_area_id: {
        type: Sequelize.INTEGER
      },
      jurisdiction_id: {
        type: Sequelize.INTEGER
      },
      dob: {
        type: Sequelize.DATE
      },
      bar_council_id: {
        type: Sequelize.STRING
      },
      case_handled: {
        type: Sequelize.STRING
      },
      practice_start: {
        type: Sequelize.DATE
      },
      rate: {
        type: Sequelize.STRING
      },
      address: {
        type: Sequelize.TEXT
      },
      chember_address: {
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
    return queryInterface.dropTable('lawyers');
  }
};