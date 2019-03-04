'use strict';
module.exports = (sequelize, DataTypes) => {
  const firm = sequelize.define('firm', {
    name: DataTypes.STRING,
    status: DataTypes.INTEGER,
    image: DataTypes.STRING
  }, {});
  firm.associate = function(models) {
    // associations can be defined here
  };
  return firm;
};