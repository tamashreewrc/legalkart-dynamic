"use strict";
module.exports = (sequelize, DataTypes) => {
  var about_us_content = sequelize.define(
    "about_us_content",
    {
      about_us_title: DataTypes.STRING,
      about_us_meta_title: DataTypes.STRING,
      about_us_meta_keyword: DataTypes.STRING,
      about_us_meta_description: DataTypes.TEXT,
      content_1: DataTypes.TEXT,
      content_2: DataTypes.TEXT,
      image_1: DataTypes.STRING,
      image_2: DataTypes.STRING
    },
    {}
  );
  about_us_content.associate = function(models) {
    // associations can be defined here
  };
  return about_us_content;
};
