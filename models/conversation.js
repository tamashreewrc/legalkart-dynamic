'use strict';
module.exports = (sequelize, DataTypes) => {
  const conversation = sequelize.define('conversation', {
    case_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    c_msg: DataTypes.TEXT,
    remarks: DataTypes.TEXT,
    status: DataTypes.INTEGER,
    c_image: DataTypes.STRING
  }, {});
  conversation.associate = function(models) {
    // associations can be defined here
  };
  return conversation;
};