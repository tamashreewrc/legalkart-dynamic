'use strict';
module.exports = (sequelize, DataTypes) => {
  const login_device_detail = sequelize.define('login_device_detail', {
    user_id: DataTypes.INTEGER,
    ip_address: DataTypes.STRING,
    platform: DataTypes.STRING,
    device_cordova: DataTypes.STRING,
    device_model: DataTypes.STRING,
    device_platform: DataTypes.STRING,
    device_uuid: DataTypes.STRING,
    device_version: DataTypes.STRING,
    device_manufacturer: DataTypes.STRING,
    device_isvirtual: DataTypes.STRING,
    device_serial: DataTypes.STRING,
    status: DataTypes.STRING
  }, {});
  login_device_detail.associate = function(models) {
    // associations can be defined here
  };
  return login_device_detail;
};