'use strict';
module.exports = (sequelize, DataTypes) => {
  const rate = sequelize.define('rate', {
    name: DataTypes.STRING,
    rate: DataTypes.STRING,
    old_rate: DataTypes.STRING,
    status:DataTypes.STRING,
    one_to_one: DataTypes.STRING,
    email_consal: DataTypes.STRING,
    phone_consal: DataTypes.STRING,
    rate_lawyers:DataTypes.STRING
  }, {});
  rate.associate = function(models) {
    // associations can be defined here
  };
  return rate;
};