'use strict';
module.exports = (sequelize, DataTypes) => {
  var role = sequelize.define('role', {
    title: DataTypes.STRING
  }, {});
  role.associate = function(models) {
    // associations can be defined here
  };
  return role;
};