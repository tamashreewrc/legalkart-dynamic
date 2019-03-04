//module
const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const auth = require('../middlewares/auth');

//csrf tocken
var csrfProtection = csrf({
    cookie: true
})


//model
const Pacticearea = require('../models').pacticearea;
const SubPacticearea = require('../models').sub_pacticearea;


router.get("/practiceArea", csrfProtection, auth, async (req, res) => {
    var success_add_practicearea = req.flash('add-Practicearea')[0];
    var success_del_practicearea = req.flash('del-Practicearea')[0];
    const pacticearea = await Pacticearea.findAll();
    var msg = req.flash('loginMessage')[0];
    res.render('practice_area/', {
        layout: 'dashboard',
        title: 'Practice Area',
        message: msg,
        csrfToken: req.csrfToken(),
        pacticearea,
        success_add_practicearea,
        success_del_practicearea
    });
});

router.get("/practicearea_add", csrfProtection, auth, async (req, res) => {
    const pacticearea = await Pacticearea.findAll();
    var msg = req.flash('loginMessage')[0];
    res.render('practice_area/add', {
        layout: 'dashboard',
        title: 'Practice Area',
        message: msg,
        csrfToken: req.csrfToken(),
        pacticearea
    });
});


router.post("/practicearea_add", csrfProtection, auth, async (req, res) => {
    if (req.body.practice_status == 0) {
        await Pacticearea.create({
            name: req.body.practice_name,
            remarks: req.body.practice_remarks,
            status: 0
        });
    } else {
        await SubPacticearea.create({
            name: req.body.practice_name,
            remarks: req.body.practice_remarks,
            status: 0,
            p_id: req.body.practice_status
        });
    }
    req.flash('add-Practicearea', 'Practice Area Added Successfully');
    res.redirect('/practiceArea')

});

router.post("/practicearea/edit", csrfProtection, auth, async (req, res) => {

    await Pacticearea.update({
        name: req.body.practice_name,
        remarks: req.body.practice_remarks,
    }, {
        where: {
            id: req.body.practice_id
        }
    });
    req.flash('add-Practicearea', 'Practice Area Edit Successfully');

    res.redirect('/practiceArea')

});

router.post("/practicearea/delete", csrfProtection, auth, async (req, res) => {
    await Pacticearea.destroy({
        where: {
            id: req.body.practicedelete_id
        }
    });
    req.flash('del-Practicearea', 'Practice Area Delete Successfully');
    res.redirect('/practiceArea')

});


module.exports = router;