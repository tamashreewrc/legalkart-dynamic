'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.addColumn(
        'lawyers',
        'language', {
          type: Sequelize.STRING,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'lawyers',
        'address1', {
          type: Sequelize.TEXT,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'lawyers',
        'address2', {
          type: Sequelize.TEXT,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'lawyers',
        'address3', {
          type: Sequelize.TEXT,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'lawyers',
        'state', {
          type: Sequelize.INTEGER,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'lawyers',
        'city', {
          type: Sequelize.INTEGER,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'lawyers',
        'bio', {
          type: Sequelize.TEXT,
          allowNull: true
        }
      )
    ]
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
