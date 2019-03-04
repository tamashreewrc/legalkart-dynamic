"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.addColumn("stamp_papers", "stamp_paper_state", {
        type: Sequelize.INTEGER
      }),
      queryInterface.addColumn("stamp_papers", "shipping_state", {
        type: Sequelize.INTEGER
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
