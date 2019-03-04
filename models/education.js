'use strict';
module.exports = (sequelize, DataTypes) => {
  var education = sequelize.define('education', {
    lawyer_id: DataTypes.INTEGER,
    degree: DataTypes.STRING,
    university: DataTypes.STRING,
    year: DataTypes.STRING,
    status: DataTypes.INTEGER
  }, {});
  education.associate = function(models) {
    // associations can be defined here
  };
  return education;
};