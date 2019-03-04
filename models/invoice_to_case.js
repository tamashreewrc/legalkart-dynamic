'use strict';
module.exports = (sequelize, DataTypes) => {
  var invoice_to_case = sequelize.define('invoice_to_case', {
    invoice_id: DataTypes.INTEGER,
    case_id: DataTypes.INTEGER,
    status: DataTypes.INTEGER
  }, {});
  invoice_to_case.associate = function(models) {
    // associations can be defined here
  };
  return invoice_to_case;
};