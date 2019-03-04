'use strict';
module.exports = (sequelize, DataTypes) => {
  var invoice_payment = sequelize.define('invoice_payment', {
    invoice_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    payment_mode: DataTypes.STRING,
    payment_no: DataTypes.STRING,
    remarks: DataTypes.TEXT,
    status: DataTypes.INTEGER
  }, {});
  invoice_payment.associate = function(models) {
    // associations can be defined here
  };
  return invoice_payment;
};