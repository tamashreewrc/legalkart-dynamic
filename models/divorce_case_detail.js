'use strict';
            module.exports = (sequelize, DataTypes) => {
                const divorce_case_detail = sequelize.define('divorce_case_detail', {
                    case_id: DataTypes.INTEGER,
                    select_1551941398467:DataTypes.STRING
                }, {});
                divorce_case_detail.associate = function (models) {
                    // associations can be defined here
                };
                return divorce_case_detail;
            };