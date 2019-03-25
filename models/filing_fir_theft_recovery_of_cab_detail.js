'use strict';
            module.exports = (sequelize, DataTypes) => {
                const filing_fir_theft_recovery_of_cab_detail = sequelize.define('filing_fir_theft_recovery_of_cab_detail', {
                    case_id: DataTypes.INTEGER,
                    radio_group_1551944289791:DataTypes.STRING
                }, {});
                filing_fir_theft_recovery_of_cab_detail.associate = function (models) {
                    // associations can be defined here
                };
                return filing_fir_theft_recovery_of_cab_detail;
            };