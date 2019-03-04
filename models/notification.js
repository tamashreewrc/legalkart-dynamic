'use strict';
module.exports = (sequelize, DataTypes) => {
  const notification = sequelize.define('notification', {
    name: DataTypes.STRING,
    remarks: DataTypes.TEXT,
    status: DataTypes.INTEGER,
    sender_id: DataTypes.INTEGER,
    receive_id: DataTypes.INTEGER,
    img:DataTypes.STRING,
    link:DataTypes.STRING
  }, {});
  notification.associate = function(models) {
    // associations can be defined here
  };
  return notification;
};