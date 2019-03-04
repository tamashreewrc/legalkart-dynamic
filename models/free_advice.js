'use strict';
module.exports = (sequelize, DataTypes) => {
  var free_advice = sequelize.define('free_advice', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    state: DataTypes.INTEGER,
    city: DataTypes.INTEGER,
    mobile: DataTypes.STRING,
    subject: DataTypes.TEXT,
    message: DataTypes.TEXT,
    status: DataTypes.INTEGER
  }, {});
  free_advice.associate = function(models) {
    // associations can be defined here
  };
  return free_advice;
};