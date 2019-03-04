const express = require('express');
const auth = require('../middlewares/auth');
const User = require("../models").user;
const SubLegalService = require('../models').legal_service_sub_category;
const OrderLegalService = require('../models').order_legal_service;
const LawyerContact = require("../models").lawyer_contact;

const router = express.Router();

router.get("/all-enquiry", auth, async (req, res) => {
    LawyerContact.belongsTo(User, {
        foreignKey: 'lawyer_id'
    });
    OrderLegalService.belongsTo(SubLegalService, {
        foreignKey: 'legal_service_category_id'
    });
    var whereCondition = {};
    if (req.user.role_id == "2"){
        whereCondition.lawyer_id = req.user.id
    }
    const lawyer_contact = await LawyerContact.findAll({
        where: whereCondition,
        include: [{
            model: User
        }],
        order: [
            ['id', 'DESC']
        ]
    });
    const order_legal_service = await OrderLegalService.findAll({
        include: [{
            model: SubLegalService
        }],
        order: [
            ['id', 'DESC']
        ]
    });
    res.render("enquiry/index", {
        layout: "dashboard",
        title: "All Enquiries",
        lawyer_contact,
        order_legal_service
    });
});

module.exports = router;