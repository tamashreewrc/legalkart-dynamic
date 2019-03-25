'use strict';
            module.exports = (sequelize, DataTypes) => {
                const deputation_of_a_mid_level_lawyer_detail = sequelize.define('deputation_of_a_mid_level_lawyer_detail', {
                    case_id: DataTypes.INTEGER,
                    file_1551941330474:DataTypes.STRING
                }, {});
                deputation_of_a_mid_level_lawyer_detail.associate = function (models) {
                    // associations can be defined here
                };
                return deputation_of_a_mid_level_lawyer_detail;
            };