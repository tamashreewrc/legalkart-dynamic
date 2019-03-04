'use strict';
module.exports = (sequelize, DataTypes) => {
  var case_type = sequelize.define('case_type', {
    name: DataTypes.STRING,
    tag: DataTypes.STRING,
    status: DataTypes.INTEGER
  }, {});
  case_type.associate = function(models) {
    // associations can be defined here
  };
  return case_type;
};