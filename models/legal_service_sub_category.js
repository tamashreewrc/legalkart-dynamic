'use strict';
module.exports = (sequelize, DataTypes) => {
  var legal_service_sub_category = sequelize.define('legal_service_sub_category', {
    legal_service_category_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    sub_head: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
    publish_status: DataTypes.INTEGER,
  }, {});
  legal_service_sub_category.associate = function(models) {
    // associations can be defined here
  };
  return legal_service_sub_category;
};