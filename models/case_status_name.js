'use strict';
module.exports = (sequelize, DataTypes) => {
  var case_status_name = sequelize.define('case_status_name', {
    name: DataTypes.STRING,
    status: DataTypes.INTEGER
  }, {});
  case_status_name.associate = function(models) {
    // associations can be defined here
  };
  return case_status_name;
};