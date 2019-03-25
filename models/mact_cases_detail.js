'use strict';
            module.exports = (sequelize, DataTypes) => {
                const mact_cases_detail = sequelize.define('mact_cases_detail', {
                    case_id: DataTypes.INTEGER,
                    testtext:DataTypes.STRING
                }, {});
                mact_cases_detail.associate = function (models) {
                    // associations can be defined here
                };
                return mact_cases_detail;
            };