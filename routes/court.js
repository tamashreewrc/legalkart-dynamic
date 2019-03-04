//module
const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const auth = require('../middlewares/auth');

//csrf tocken
var csrfProtection = csrf({
    cookie: true
})

const court = require('../models').court;


router.get("/court", csrfProtection, auth, async (req, res) => {
    var success_add_court = req.flash('add-court')[0];
    var success_del_court = req.flash('del-court')[0];

    const courtDetails = await court.findAll();

    var msg = req.flash('loginMessage')[0];

    res.render('court/index', {
        layout: 'dashboard',
        title: 'Court',
        message: msg,
        csrfToken: req.csrfToken(),
        courtDetails,
        success_add_court,
        success_del_court
    });
});


router.get("/court-add", csrfProtection, auth, async (req, res) => {
    var msg = req.flash('loginMessage')[0];
    res.render('court/add', {
        layout: 'dashboard',
        title: 'Court',
        message: msg,
        csrfToken: req.csrfToken(),
    });
});


router.post("/court/add", csrfProtection, auth, async (req, res) => {

    await court.create({
        name: req.body.name,
    });

    req.flash('add-court', 'Court Added Successfully');
    res.redirect('/court')

});


router.post("/edit-court", csrfProtection, auth, async (req, res) => {

    await court.update({
        name: req.body.edit_name,
    },{
        where: {
            id:req.body.court_id
        }
    });

    res.json({
        success: true
    });

});


router.post("/court/delete", csrfProtection, auth, async (req, res) => {
    await court.destroy({
        where: {
            id: req.body.courtdel_id
        }
    });

    req.flash('del-court', 'Court Delete Successfully');
    res.redirect('/court')

});



module.exports = router;