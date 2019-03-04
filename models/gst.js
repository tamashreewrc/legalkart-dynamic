'use strict';
module.exports = (sequelize, DataTypes) => {
  const gst = sequelize.define('gst', {
    gst_percent: DataTypes.TEXT,
    status: DataTypes.INTEGER
  }, {});
  gst.associate = function(models) {
    // associations can be defined here
  };
  return gst;
};