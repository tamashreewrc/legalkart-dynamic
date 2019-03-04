'use strict';
module.exports = (sequelize, DataTypes) => {
  var court = sequelize.define('court', {
    name: DataTypes.STRING
  }, {});
  court.associate = function(models) {
    // associations can be defined here
  };
  return court;
};