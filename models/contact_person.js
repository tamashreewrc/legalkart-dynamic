'use strict';
module.exports = (sequelize, DataTypes) => {
  const contact_person = sequelize.define('contact_person', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    custome_id: DataTypes.INTEGER,
    status: DataTypes.INTEGER
  }, {});
  contact_person.associate = function(models) {
    // associations can be defined here
  };
  return contact_person;
};