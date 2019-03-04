'use strict';
module.exports = (sequelize, DataTypes) => {
  const lawyer_assignment = sequelize.define('lawyer_assignment', {
    lawyer_id: DataTypes.INTEGER,
    case_id: DataTypes.TEXT,
    invoice_status: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
    invitation_status: DataTypes.INTEGER,
    payment_status: DataTypes.INTEGER
  }, {});
  lawyer_assignment.associate = function(models) {
    // associations can be defined here
  };
  return lawyer_assignment;
};