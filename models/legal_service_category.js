'use strict';
module.exports = (sequelize, DataTypes) => {
  var legal_service_category = sequelize.define('legal_service_category', {
    name: DataTypes.STRING,
    status: DataTypes.INTEGER
  }, {});
  legal_service_category.associate = function(models) {
    // associations can be defined here
  };
  return legal_service_category;
};