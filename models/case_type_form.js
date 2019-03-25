'use strict';
module.exports = (sequelize, DataTypes) => {
  var case_type_form = sequelize.define('case_type_form', {
    case_type_id: DataTypes.INTEGER,
    input_type: DataTypes.STRING,
    name: DataTypes.STRING,
    placeholder: DataTypes.STRING,
    label: DataTypes.STRING,
    required: DataTypes.STRING,
    sub_type: DataTypes.STRING,
    status: DataTypes.STRING
  }, {});
  case_type_form.associate = function(models) {
    // associations can be defined here
  };
  return case_type_form;
};