'use strict';
module.exports = (sequelize, DataTypes) => {
  var bulk_case = sequelize.define('bulk_case', {
    user_id: DataTypes.INTEGER,
    firm_id: DataTypes.INTEGER,
    case_length: DataTypes.STRING,
    excel_file_name: DataTypes.STRING,
    case_type_id: DataTypes.INTEGER,
    status: DataTypes.INTEGER
  }, {});
  bulk_case.associate = function(models) {
    // associations can be defined here
  };
  return bulk_case;
};