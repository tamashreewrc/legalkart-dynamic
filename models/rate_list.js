'use strict';
module.exports = (sequelize, DataTypes) => {
  const rate_list = sequelize.define('rate_list', {
    type_of_case: DataTypes.STRING,
    rate_card: DataTypes.STRING,
    status: DataTypes.INTEGER
  }, {});
  rate_list.associate = function(models) {
    // associations can be defined here
  };
  return rate_list;
};