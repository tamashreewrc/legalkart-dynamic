'use strict';
module.exports = (sequelize, DataTypes) => {
  var lawyer_rating_review = sequelize.define('lawyer_rating_review', {
    lawyer_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    reviews: DataTypes.TEXT,
    ratings: DataTypes.STRING,
    publish_status: DataTypes.INTEGER,
    status: DataTypes.INTEGER
  }, {});
  lawyer_rating_review.associate = function(models) {
    // associations can be defined here
  };
  return lawyer_rating_review;
};