"use strict";
module.exports = (sequelize, DataTypes) => {
  var stamp_paper = sequelize.define(
    "stamp_paper",
    {
      user_id: DataTypes.INTEGER,
      first_party: DataTypes.STRING,
      second_party: DataTypes.STRING,
      purchaser: DataTypes.STRING,
      stampduty_paid_by: DataTypes.STRING,
      stamp_paper_value: DataTypes.STRING,
      no_of_stamp_paper: DataTypes.STRING,
      document_description: DataTypes.STRING,
      property_description: DataTypes.STRING,
      shipping_customer_full_name: DataTypes.STRING,
      shipping_telephone_no: DataTypes.STRING,
      shipping_email_id: DataTypes.STRING,
      shipping_address: DataTypes.STRING,
      shipping_city: DataTypes.STRING,
      shipping_pincode: DataTypes.STRING,
      stamp_paper_state: DataTypes.INTEGER,
      shipping_state: DataTypes.INTEGER,
      status: DataTypes.INTEGER,
      payment_id: DataTypes.STRING,
    },
    {}
  );
  stamp_paper.associate = function(models) {
    // associations can be defined here
  };
  return stamp_paper;
};
