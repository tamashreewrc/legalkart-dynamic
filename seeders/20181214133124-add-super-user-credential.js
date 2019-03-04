'use strict';
const bCrypt = require('bcrypt-nodejs');
const gravatar = require('gravatar');

module.exports = {
  up: (queryInterface, Sequelize) => {
    // const avatar = gravatar.url("admin@wrctpl.com", {
    //   s: '150',
    //   r: 'pg',
    //   d: 'mm'
    // });
    // return queryInterface.bulkInsert('users', [{
    //   first_name: "Partho",
    //   last_name: "Sen",
    //   email: "admin@wrctpl.com",
    //   password: bCrypt.hashSync("wrc2017!"),
    //   mobile: "9988774466",
    //   avatar,
    //   createdAt: new Date(),
    //   updatedAt: new Date()
    // }], {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */
  }
};
