'use strict';
module.exports = (sequelize, DataTypes) => {
  var practice_area_to_lawyer = sequelize.define('practice_area_to_lawyer', {
    lawyer_id: DataTypes.INTEGER,
    practice_area_id: DataTypes.INTEGER,
    sub_practice_area_id: DataTypes.INTEGER,
    status: DataTypes.INTEGER
  }, {});
  practice_area_to_lawyer.associate = function(models) {
    // associations can be defined here
  };
  return practice_area_to_lawyer;
};