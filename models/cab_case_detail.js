'use strict';
module.exports = (sequelize, DataTypes) => {
  var cab_case_detail = sequelize.define('cab_case_detail', {
    case_id: DataTypes.INTEGER,
    date_of_assignment: DataTypes.DATE,
    impound_status: DataTypes.STRING,
    judge_name: DataTypes.STRING,
    court_id: DataTypes.INTEGER,
    driver_name: DataTypes.STRING,
    name_of_ps: DataTypes.STRING,
    driver_mobile: DataTypes.STRING,
    advocate: DataTypes.STRING
  }, {});
  cab_case_detail.associate = function(models) {
    // associations can be defined here
  };
  return cab_case_detail;
};