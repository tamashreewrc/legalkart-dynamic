'use strict';
            module.exports = (sequelize, DataTypes) => {
                const representation_befoe_rto_sta_transport_authority_detail = sequelize.define('representation_befoe_rto_sta_transport_authority_detail', {
                    case_id: DataTypes.INTEGER,
                    demo4:DataTypes.STRING
                }, {});
                representation_befoe_rto_sta_transport_authority_detail.associate = function (models) {
                    // associations can be defined here
                };
                return representation_befoe_rto_sta_transport_authority_detail;
            };