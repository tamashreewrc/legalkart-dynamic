'use strict';
module.exports = (sequelize, DataTypes) => {
  const additional_cost_case = sequelize.define('additional_cost_case', {
    case_id: DataTypes.INTEGER,
    amount: DataTypes.STRING,
    govt_fee: DataTypes.STRING,
    admin_add_fee: DataTypes.STRING,
    status: DataTypes.INTEGER
  }, {});
  additional_cost_case.associate = function(models) {
    // associations can be defined here
  };
  return additional_cost_case;
};