'use strict';
module.exports = (sequelize, DataTypes) => {
  const faq = sequelize.define('faq', {
    question: DataTypes.TEXT,
    answer: DataTypes.TEXT,
    remarks: DataTypes.TEXT,
    status: DataTypes.INTEGER
  }, {});
  faq.associate = function(models) {
    // associations can be defined here
  };
  return faq;
};