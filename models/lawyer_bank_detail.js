'use strict';
module.exports = (sequelize, DataTypes) => {
  var lawyer_bank_detail = sequelize.define('lawyer_bank_detail', {
    lawyer_id: DataTypes.INTEGER,
    account_number: DataTypes.STRING,
    ifsc_code: DataTypes.STRING,
    bank_name: DataTypes.STRING,
    account_holder: DataTypes.STRING,
    pan_no: DataTypes.STRING,
    status: DataTypes.INTEGER
  }, {});
  lawyer_bank_detail.associate = function(models) {
    // associations can be defined here
  };
  return lawyer_bank_detail;
};