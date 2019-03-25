'use strict';
            module.exports = (sequelize, DataTypes) => {
                const filing_police_compalint__detail = sequelize.define('filing_police_compalint__detail', {
                    case_id: DataTypes.INTEGER,
                    textarea_1551864777677:DataTypes.TEXT
                }, {});
                filing_police_compalint__detail.associate = function (models) {
                    // associations can be defined here
                };
                return filing_police_compalint__detail;
            };