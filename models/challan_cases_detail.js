'use strict';
          module.exports = (sequelize, DataTypes) => {
              const challan_cases_detail = sequelize.define('challan_cases_detail', {
                  case_id: DataTypes.INTEGER,
                  comment:DataTypes.TEXT,name:DataTypes.STRING,gender:DataTypes.STRING,age:DataTypes.STRING,number:DataTypes.STRING,salary:DataTypes.STRING,message:DataTypes.TEXT,text_1553509610134:DataTypes.STRING,test_again:DataTypes.STRING
              }, {});
              challan_cases_detail.associate = function (models) {
                  // associations can be defined here
              };
              return challan_cases_detail;
          };