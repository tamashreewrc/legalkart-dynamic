'use strict';
module.exports = (sequelize, DataTypes) => {
  var order_legal_service = sequelize.define('order_legal_service', {
    legal_service_category_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    mobile: DataTypes.STRING,
    messages: DataTypes.TEXT,
    status: DataTypes.INTEGER
  }, {});
  order_legal_service.associate = function(models) {
    // associations can be defined here
  };
  return order_legal_service;
};