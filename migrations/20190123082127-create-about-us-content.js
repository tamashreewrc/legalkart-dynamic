'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('about_us_contents', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      about_us_title: {
        type: Sequelize.STRING
      },
      about_us_meta_title: {
        type: Sequelize.STRING
      },
      about_us_meta_keyword: {
        type: Sequelize.STRING
      },
      about_us_meta_description: {
        type: Sequelize.TEXT
      },
      content_1: {
        type: Sequelize.TEXT
      },
      content_2: {
        type: Sequelize.TEXT
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
    return queryInterface.dropTable('about_us_contents');
  }
};