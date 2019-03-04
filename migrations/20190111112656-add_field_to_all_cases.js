"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.addColumn("all_cases", "payment_amount", {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn("all_cases", "payment_id", {
        type: Sequelize.STRING
      })
    ];
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
