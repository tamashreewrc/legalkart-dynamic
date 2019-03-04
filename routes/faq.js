//module
const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const auth = require('../middlewares/auth');

//model
const Faq = require('../models').faq;

//csrf tocken
var csrfProtection = csrf({
    cookie: true
})


router.get("/legaljart_faq", csrfProtection, auth, async (req, res) => {
    var success_add_Faq = req.flash('add-Faq')[0];
    var success_del_Faq = req.flash('del-Faq')[0];
    const faq = await Faq.findAll();
    var msg = req.flash('loginMessage')[0];
    res.render('faq/', {
        layout: 'dashboard',
        title: 'Faq',
        message: msg,
        csrfToken: req.csrfToken(),
        faq,
        success_add_Faq,
        success_del_Faq
    });
});


router.get("/faq-add", csrfProtection, auth, async (req, res) => {
    var msg = req.flash('loginMessage')[0];
    res.render('faq/add', {
        layout: 'dashboard',
        title: 'Faq',
        message: msg,
        csrfToken: req.csrfToken(),
    });
});


router.post("/faq/add", csrfProtection, auth, async (req, res) => {

    await Faq.create({
        question: req.body.question,
        answer: req.body.answer,
        remarks: req.body.remarks,
        status: 0
    });

    req.flash('add-Faq', 'Faq Added Successfully');
    res.redirect('/legaljart_faq')

});


router.post("/faq/edit", csrfProtection, auth, async (req, res) => {

    await Faq.update({
        question: req.body.question,
        answer: req.body.answer,
        remarks: req.body.remarks,
        status: 0
    },{
        where:{
            id: req.body.faq_id
        } 
    });

    req.flash('add-Faq', 'Faq Added Successfully');
    res.redirect('/legaljart_faq')

});

router.post("/faq/delete", csrfProtection, auth, async (req, res) => {
    await Faq.destroy({
        
        where:{
            id: req.body.faqId 
        }
        
    });

    req.flash('del-Faq', 'Faq Delete Successfully');
    res.redirect('/legaljart_faq')

});



module.exports = router;