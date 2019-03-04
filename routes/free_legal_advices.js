const express = require('express');
const FreeLegalAdvice = require('../models').free_advice;
const auth = require('../middlewares/auth');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;


const router = express.Router();

router.get("/free-legal-advices", auth, async(req, res)=> {
    const getFreeLegalAdvices = await FreeLegalAdvice.findAll({
        order: [
            ['id', 'DESC']
        ]
    })
    res.render("free_legal_advices/index", {
        layout: "dashboard",
        title:"Free Legal Advices",
        getFreeLegalAdvices
    });
});

module.exports = router;