'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('case_type_forms', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      case_type_id: {
        type: Sequelize.INTEGER
      },
      input_type: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      placeholder: {
        type: Sequelize.STRING
      },
      label: {
        type: Sequelize.STRING
      },
      required: {
        type: Sequelize.STRING
      },
      sub_type: {
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
    return queryInterface.dropTable('case_type_forms');
  }
};