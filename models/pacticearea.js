'use strict';
module.exports = (sequelize, DataTypes) => {
  const pacticearea = sequelize.define('pacticearea', {
    name: DataTypes.STRING,
    remarks: DataTypes.TEXT,
    status: DataTypes.INTEGER
  }, {});
  pacticearea.associate = function(models) {
    // associations can be defined here
  };
  return pacticearea;
};