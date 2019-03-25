'use strict';
          module.exports = (sequelize, DataTypes) => {
              const arbitration_cases_detail = sequelize.define('arbitration_cases_detail', {
                  case_id: DataTypes.INTEGER,
                  year:DataTypes.STRING,color:DataTypes.STRING,issue_date:DataTypes.DATE
              }, {});
              arbitration_cases_detail.associate = function (models) {
                  // associations can be defined here
              };
              return arbitration_cases_detail;
          };