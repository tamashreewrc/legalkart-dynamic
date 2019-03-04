const express = require('express');
const auth = require('../middlewares/auth');
const Gst = require('../models').gst;
const csrf = require('csurf');

//csrf tocken
var csrfProtection = csrf({
    cookie: true
})

const router = express.Router();

router.get('/legalkart-gst', auth, csrfProtection, async (req, res) => {
    var success_add_gst = req.flash('add-rate')[0];
    var success_edit_gst = req.flash('gst-edit')[0];
    var success_delete_gst = req.flash('gst-delete')[0];
    var gstDetails = await Gst.findAll();
    res.render('gst/index',{
        layout: "dashboard",
        title: "All Gst",
        success_add_gst,
        gstDetails,
        success_edit_gst,
        csrfToken: req.csrfToken(),
        success_delete_gst
       
    })
});


router.get('/gst/add', auth, csrfProtection, async(req,res)=> {

    res.render('gst/add',{
        layout: 'dashboard',
        title:'gast add',
        csrfToken: req.csrfToken()
    });

});

router.post('/legalcart-gst/add', auth, csrfProtection, async(req,res)=> {

    await Gst.create({
        gst_percent: req.body.name,
        status: 0
    });

    req.flash('add-gst', 'GST Added Successfully');
    res.redirect('/legalkart-gst')
});

router.post('/legalcart-gst/edit', auth ,csrfProtection, async (req,res) => {

    await Gst.update({
        gst_percent: req.body.edit_name
    }, {
        where: {
            id: req.body.gst_id
        }
    })

    req.flash('gst-edit', 'GST edit successfully');
    res.redirect('/legalkart-gst')
});

router.post('/legalcart-gst/delete', auth, async (req,res)=> {

    await Gst.destroy({
        where:{
            id:req.body.legalcart_gst_id
        }
    })

    req.flash('gst-delete', 'GST delete successfully');
    res.redirect('/legalkart-gst')
});


module.exports = router;
