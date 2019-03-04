'use strict';
module.exports = (sequelize, DataTypes) => {
  var legal_service_content = sequelize.define('legal_service_content', {
    legal_service_id: DataTypes.INTEGER,
    legal_service_sub_id: DataTypes.INTEGER,
    avatar: DataTypes.STRING,
    content: DataTypes.TEXT,
    status: DataTypes.INTEGER
  }, {});
  legal_service_content.associate = function(models) {
    // associations can be defined here
  };
  return legal_service_content;
};