'use strict';
module.exports = (sequelize, DataTypes) => {
  var why_choose_us_content = sequelize.define('why_choose_us_content', {
    title: DataTypes.STRING,
    image: DataTypes.STRING,
    description: DataTypes.TEXT
  }, {});
  why_choose_us_content.associate = function(models) {
    // associations can be defined here
  };
  return why_choose_us_content;
};