'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    // return [
    //   queryInterface.addColumn(
    //     'customers',
    //     'user_id', {
    //       type: Sequelize.INTEGER,
    //       allowNull: true
    //     }
    //   )
    // ]
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
