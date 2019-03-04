'use strict';
module.exports = (sequelize, DataTypes) => {
  const customer = sequelize.define('customer', {
    name: DataTypes.STRING,
    firm_id: DataTypes.INTEGER,
    logo: DataTypes.STRING,
    gst: DataTypes.STRING,
    state_id: DataTypes.INTEGER,
    city_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    status: DataTypes.INTEGER
  }, {});
  customer.associate = function(models) {
    // associations can be defined here
  };
  return customer;
};