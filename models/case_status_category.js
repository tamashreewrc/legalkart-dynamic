'use strict';
module.exports = (sequelize, DataTypes) => {
  var case_status_category = sequelize.define('case_status_category', {
    name: DataTypes.STRING,
    status: DataTypes.INTEGER
  }, {});
  case_status_category.associate = function(models) {
    // associations can be defined here
  };
  return case_status_category;
};