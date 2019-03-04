'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('mact_case_details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      case_id: {
        type: Sequelize.INTEGER
      },
      case_no: {
        type: Sequelize.STRING
      },
      name_of_ps: {
        type: Sequelize.STRING
      },
      judge_name: {
        type: Sequelize.STRING
      },
      court_id: {
        type: Sequelize.INTEGER
      },
      stage_of_hearing: {
        type: Sequelize.STRING
      },
      claim_amount: {
        type: Sequelize.STRING
      },
      next_date_of_hearing: {
        type: Sequelize.DATE
      },
      advocate: {
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
    return queryInterface.dropTable('mact_case_details');
  }
};