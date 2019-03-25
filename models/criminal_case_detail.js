'use strict';
            module.exports = (sequelize, DataTypes) => {
                const criminal_case_detail = sequelize.define('criminal_case_detail', {
                    case_id: DataTypes.INTEGER,
                    gender:DataTypes.STRING
                }, {});
                criminal_case_detail.associate = function (models) {
                    // associations can be defined here
                };
                return criminal_case_detail;
            };