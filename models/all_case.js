"use strict";
module.exports = (sequelize, DataTypes) => {
  var all_case = sequelize.define(
    "all_case",
    {
      case_no: DataTypes.STRING,
      cab_no: DataTypes.STRING,
      customer_id: DataTypes.INTEGER,
      case_type: DataTypes.STRING,
      status: DataTypes.INTEGER,
      closeing_status: DataTypes.INTEGER,
      firm_id: DataTypes.INTEGER,
      description: DataTypes.TEXT,
      case_type_id: DataTypes.INTEGER,
      customer_type: DataTypes.STRING,
      payment_status: DataTypes.STRING,
      city_id: DataTypes.INTEGER,
      state_id: DataTypes.INTEGER,
      bulk_case_id: DataTypes.INTEGER,
      payment_amount: DataTypes.STRING,
      create_case_date: DataTypes.STRING,
      close_case_date: DataTypes.STRING,
      payment_id: DataTypes.STRING,
      invitation:DataTypes.INTEGER
    },
    {}
  );
  all_case.associate = function(models) {
    // associations can be defined here
  };
  return all_case;
};
