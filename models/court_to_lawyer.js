'use strict';
module.exports = (sequelize, DataTypes) => {
  var court_to_lawyer = sequelize.define('court_to_lawyer', {
    lawyer_id: DataTypes.INTEGER,
    court_id: DataTypes.INTEGER,
    status: DataTypes.INTEGER
  }, {});
  court_to_lawyer.associate = function(models) {
    // associations can be defined here
  };
  return court_to_lawyer;
};