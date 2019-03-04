"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("stamp_papers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      first_party: {
        type: Sequelize.STRING
      },
      second_party: {
        type: Sequelize.STRING
      },
      purchaser: {
        type: Sequelize.STRING
      },
      stampduty_paid_by: {
        type: Sequelize.STRING
      },
      stamp_paper_value: {
        type: Sequelize.STRING
      },
      no_of_stamp_paper: {
        type: Sequelize.STRING
      },
      document_description: {
        type: Sequelize.STRING
      },
      property_description: {
        type: Sequelize.STRING
      },
      shipping_customer_full_name: {
        type: Sequelize.STRING
      },
      shipping_telephone_no: {
        type: Sequelize.STRING
      },
      shipping_email_id: {
        type: Sequelize.STRING
      },
      shipping_address: {
        type: Sequelize.STRING
      },
      shipping_city: {
        type: Sequelize.STRING
      },
      shipping_pincode: {
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
    return queryInterface.dropTable("stamp_papers");
  }
};
