'use strict';
module.exports = (sequelize, DataTypes) => {
  var lawyer_contact = sequelize.define('lawyer_contact', {
    lawyer_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    mobile: DataTypes.STRING,
    subject: DataTypes.STRING,
    messages: DataTypes.TEXT,
    status: DataTypes.INTEGER
  }, {});
  lawyer_contact.associate = function(models) {
    // associations can be defined here
  };
  return lawyer_contact;
};