'use strict';
module.exports = (sequelize, DataTypes) => {
  const additional_all_expence = sequelize.define('additional_all_expence', {
    additional_cost_case_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    amount: DataTypes.STRING,
    status: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER
  }, {});
  additional_all_expence.associate = function(models) {
    // associations can be defined here
  };
  return additional_all_expence;
};