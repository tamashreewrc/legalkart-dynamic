'use strict';
module.exports = (sequelize, DataTypes) => {
  var account_activation = sequelize.define('account_activation', {
    user_id: DataTypes.INTEGER,
    activation_key: DataTypes.TEXT,
    status: DataTypes.INTEGER
  }, {});
  account_activation.associate = function(models) {
    // associations can be defined here
  };
  return account_activation;
};