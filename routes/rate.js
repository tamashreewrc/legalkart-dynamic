//module
const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const auth = require('../middlewares/auth');
const RateList = require('../models').rate_list;

//csrf tocken
var csrfProtection = csrf({
    cookie: true
})

const rate = require('../models').rate;


router.get("/rates", auth, async (req, res) => {
    var success_del_rate = req.flash('del-rate')[0];
    var success_add_rate = req.flash('add-rate')[0];
    var success_edit_rate = req.flash('edit-rate')[0];
    const get_rate = await rate.findAll();
    const rateTypeAll = await RateList.findAll();

    res.render("rate/index", {
        layout: "dashboard",
        title: "rate",
        get_rate,
        success_del_rate,
        success_add_rate,
        rateTypeAll,
        success_edit_rate
    });
});



router.get("/rate/add", auth, csrfProtection, async (req, res) => {

    res.render("rate/add", {
        layout: "dashboard",
        title: "Add Rate",
        csrfToken: req.csrfToken()
    });
});



router.post("/rate/add", csrfProtection, auth, async (req, res) => {

    await rate.create({
        name: req.body.name,
        rate: req.body.rate,
        status: req.body.service,
        old_rate: 0,
        one_to_one: req.body.one_rate,
        email_consal: req.body.email_rate,
        phone_consal: req.body.phone_rate,
        rate_lawyers: req.body.rate_laywers
    });

    req.flash('add-rate', ' Added Successfully');
    res.redirect('/rates')

});


// router.post("/service/reate/add", auth, async (req, res) => {
    
//     var serviceADd = await rate.create({
//         name: req.body.caseType,
//         rate: req.body.rateCard,
//         status: 'S',
//         old_rate: 0,
//         one_to_one: '0',
//         email_consal: '0',
//         phone_consal: '0',
//         rate_lawyers: '0'
//     });
    

//     res.json({
//         success: true,
//         rate_id: serviceADd.id
//     });
// });

// router.post("/service/reate/update", auth, async (req, res) => {
//     var code = 100;
    
//     var rateDetails = await rate.findOne({
//         where:{
//             id:req.body.rate_id
//         }
//     });
//     var rateNew = rateDetails.rate;
//     var oldrate = req.body.rateLawyer;

//     if (rateNew > oldrate) {
//         await rate.update({
//             rate_lawyers: req.body.rateLawyer,
//         }, {
//             where: {
//                 id: req.body.rate_id
//             }
//         });
//         code = 200
//     }

//     res.json({
//         success: true,
//         code
//     });
// });


router.post("/service/reate/add", auth, async (req, res) => {
    
    var serviceADd = await rate.create({
        name: req.body.caseType,
        rate: req.body.rateCard,
        status: 'S',
        old_rate: 0,
        one_to_one: '0',
        email_consal: '0',
        phone_consal: '0',
        rate_lawyers: req.body.rateLawyer
    });

    res.json({
        success: true,
        rate_id: serviceADd.id
    });
});


//edit
router.post("/rate/edit", auth, async (req, res) => {

    if (req.body.edit_one) {
        await rate.update({
            one_to_one: req.body.edit_one,
            email_consal: req.body.edit_email,
            phone_consal: req.body.edit_phone,
        }, {
            where: {
                id: req.body.rate_id
            }
        });


    } else {

        await rate.update({
            old_rate: req.body.old_rate,
            name: req.body.edit_name,
            rate: req.body.edit_rate,
            rate_lawyers: req.body.lawyer_rates
        }, {
            where: {
                id: req.body.court_id
            }
        });
    }
    req.flash('edit-rate', ' Edit Successfully');
    res.redirect('/rates')
});



router.post("/rate/delete", auth, async (req, res) => {
    await rate.destroy({
        where: {
            id: req.body.courtdel_id
        }
    });

    req.flash('del-rate', 'Rate Delete Successfully');
    res.redirect('/rates')

});


router.get("/rate/service/add", auth, csrfProtection, async (req, res) => {

    const rateTypeAll = await RateList.findAll();

    res.render("rate/service_add", {
        layout: "dashboard",
        title: "Add Rate",
        csrfToken: req.csrfToken(),
        rateTypeAll
    });
});

router.get("/rate/legal/add", auth, csrfProtection, async (req, res) => {

    res.render("rate/legal", {
        layout: "dashboard",
        title: "Add Rate",
        csrfToken: req.csrfToken(),
    });
});


router.get("/rate/police/add", auth, csrfProtection, async (req, res) => {

    res.render("rate/police", {
        layout: "dashboard",
        title: "Add Rate",
        csrfToken: req.csrfToken(),
    });
});

router.get("/rate/gov/add", auth, csrfProtection, async (req, res) => {

    res.render("rate/gov", {
        layout: "dashboard",
        title: "Add Rate",
        csrfToken: req.csrfToken(),
    });
});




module.exports = router;