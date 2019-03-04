'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
  //  return [
  //     queryInterface.addColumn(
  //       'rates',
  //       'one_to_one', {
  //         type: Sequelize.STRING,
  //         allowNull: true
  //       }
  //     ),
  //     queryInterface.addColumn(
  //       'rates',
  //       'email_consal', {
  //         type: Sequelize.STRING,
  //         allowNull: true
  //       }
  //     ),
  //     queryInterface.addColumn(
  //       'rates',
  //       'phone_consal', {
  //         type: Sequelize.STRING,
  //         allowNull: true
  //       }
  //     )
  //   ]
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
