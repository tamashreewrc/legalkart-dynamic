'use strict';
module.exports = (sequelize, DataTypes) => {
  var invoice = sequelize.define('invoice', {
    i_o_status: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    invoice_no: DataTypes.STRING,
    total_amount: DataTypes.STRING,
    payment_status: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
    invoice_file: DataTypes.STRING
  }, {});
  invoice.associate = function(models) {
    // associations can be defined here
  };
  return invoice;
};