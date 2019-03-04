'use strict';
module.exports = (sequelize, DataTypes) => {
  const additional_cost_case_file = sequelize.define('additional_cost_case_file', {
    additional_cost_case_id: DataTypes.INTEGER,
    file_name: DataTypes.STRING,
    status: DataTypes.INTEGER
  }, {});
  additional_cost_case_file.associate = function(models) {
    // associations can be defined here
  };
  return additional_cost_case_file;
};