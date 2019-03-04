'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
   return [
    queryInterface.addColumn(
      'all_cases',
      'cab_case_details_id',
      {
        type: Sequelize.INTEGER,
        allowNull: true
      }
    ),
    queryInterface.addColumn(
      'all_cases',
      'driver_name',
      {
        type: Sequelize.STRING,
        allowNull: true
      }
    )
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
