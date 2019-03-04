'use strict';
module.exports = (sequelize, DataTypes) => {
  const sub_pacticearea = sequelize.define('sub_pacticearea', {
    name: DataTypes.STRING,
    remarks: DataTypes.TEXT,
    status: DataTypes.INTEGER,
    p_id: DataTypes.INTEGER
  }, {});
  sub_pacticearea.associate = function(models) {
    // associations can be defined here
  };
  return sub_pacticearea;
};