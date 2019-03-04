'use strict';
module.exports = (sequelize, DataTypes) => {
  const lawyer_rate = sequelize.define('lawyer_rate', {
    lawyer_id: DataTypes.INTEGER,
    case_type_id: DataTypes.INTEGER,
    rate: DataTypes.STRING
  }, {});
  lawyer_rate.associate = function(models) {
    // associations can be defined here
  };
  return lawyer_rate;
};