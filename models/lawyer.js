'use strict';
module.exports = (sequelize, DataTypes) => {
  var lawyer = sequelize.define('lawyer', {
    lawyer_id: DataTypes.INTEGER,
    jurisdiction_id: DataTypes.INTEGER,
    court_id: DataTypes.INTEGER,
    dob: DataTypes.DATE,
    bar_council_id: DataTypes.STRING,
    case_handled: DataTypes.STRING,
    practice_start: DataTypes.DATE,
    rate: DataTypes.STRING,
    address: DataTypes.TEXT,
    chember_address: DataTypes.TEXT,
    language: DataTypes.STRING,
    address1: DataTypes.TEXT,
    address2: DataTypes.TEXT,
    address3: DataTypes.TEXT,
    city: DataTypes.INTEGER,
    state: DataTypes.INTEGER,
    bio: DataTypes.TEXT,
    panel_member: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
  }, {});
  lawyer.associate = function(models) {
    // associations can be defined here
  };
  return lawyer;
};