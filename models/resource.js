'use strict';
module.exports = (sequelize, DataTypes) => {
  var resource = sequelize.define('resource', {
    resource_type: DataTypes.STRING,
    name: DataTypes.STRING,
    avatar: DataTypes.STRING,
    content: DataTypes.TEXT,
    user_id: DataTypes.INTEGER,
    firm_id: DataTypes.INTEGER,
    status: DataTypes.INTEGER
  }, {});
  resource.associate = function(models) {
    // associations can be defined here
  };
  return resource;
};