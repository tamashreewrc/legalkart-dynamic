'use strict';
module.exports = (sequelize, DataTypes) => {
  var mact_case_detail = sequelize.define('mact_case_detail', {
    case_id: DataTypes.INTEGER,
    case_no: DataTypes.STRING,
    name_of_ps: DataTypes.STRING,
    judge_name: DataTypes.STRING,
    court_id: DataTypes.INTEGER,
    stage_of_hearing: DataTypes.STRING,
    claim_amount: DataTypes.STRING,
    next_date_of_hearing: DataTypes.DATE,
    advocate: DataTypes.STRING,
    status: DataTypes.INTEGER
  }, {});
  mact_case_detail.associate = function(models) {
    // associations can be defined here
  };
  return mact_case_detail;
};