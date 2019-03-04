'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.addColumn(
        'all_case_statuses',
        'case_status_category_id', {
          type: Sequelize.INTEGER,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'all_case_statuses',
        'remarks', {
          type: Sequelize.TEXT,
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
