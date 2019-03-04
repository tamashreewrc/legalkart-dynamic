'use strict';
module.exports = (sequelize, DataTypes) => {
  const file_for_case = sequelize.define('file_for_case', {
    name: DataTypes.STRING,
    status: DataTypes.INTEGER,
    case_id: DataTypes.INTEGER,
    bulk_id:DataTypes.INTEGER,
    filename:DataTypes.STRING
  }, {});
  file_for_case.associate = function(models) {
    // associations can be defined here
  };
  return file_for_case;
};