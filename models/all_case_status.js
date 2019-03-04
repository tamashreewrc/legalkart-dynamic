'use strict';
module.exports = (sequelize, DataTypes) => {
  var all_case_status = sequelize.define('all_case_status', {
    case_id: DataTypes.INTEGER,
    case_status_id: DataTypes.INTEGER,
    case_status_category_id: DataTypes.INTEGER,
    remarks: DataTypes.TEXT,
    user_id: DataTypes.INTEGER,
    customer_id: DataTypes.INTEGER,
    firm_id: DataTypes.INTEGER,
    status: DataTypes.INTEGER
  }, {});
  all_case_status.associate = function(models) {
    // associations can be defined here
  };
  return all_case_status;
};