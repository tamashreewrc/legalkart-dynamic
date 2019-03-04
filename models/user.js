'use strict';
module.exports = (sequelize, DataTypes) => {
  var user = sequelize.define('user', {
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    mobile: DataTypes.STRING,
    role_id: DataTypes.INTEGER,
    sub_role: DataTypes.STRING,
    avatar: DataTypes.STRING,
    firm_id: DataTypes.INTEGER,
    state_id: DataTypes.INTEGER,
    city_id: DataTypes.INTEGER,
    gender: DataTypes.STRING,
    device_fcm_id:DataTypes.STRING,
    status:DataTypes.INTEGER,
    login_first_status: DataTypes.INTEGER,
    activate_email_status: DataTypes.INTEGER,
    actual_user_id: DataTypes.INTEGER,
    super_admin_status: DataTypes.INTEGER,
    notification_email:DataTypes.STRING,
    otp:DataTypes.STRING
  }, {});
  user.associate = function(models) {
    // associations can be defined here
  };
  return user;
};