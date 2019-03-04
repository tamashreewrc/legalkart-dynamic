const express = require('express');
const csrf = require('csurf');
const User = require('../models').user;
const Firm = require('../models').firm;
//case
const Allcase = require('../models').all_case;
//case type
const CaseType = require('../models').rate_list;
const AccountActivationKey = require('../models').account_activation;
const auth = require('../middlewares/auth');
const bCrypt = require('bcrypt-nodejs');
const gravatar = require('gravatar');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;


var csrfProtection = csrf({
    cookie: true
})

const router = express.Router();


router.get("/customer", auth, async (req, res) => {

    const get_customer = await User.findAll({
        where: {
            role_id: 3
        }
    });
    
    res.render("customer/customer", {
        layout: "dashboard",
        title: "customer",
        get_customer
    });
});

router.get("/customer/view/:id", auth, async (req, res) => {
    const customer = await User.findOne({
        where: {
            id: req.params['id']
        },

    });

    Allcase.belongsTo(CaseType,{
        foreignKey: 'case_type_id'
    });

    const all_cases = await Allcase.findAll({
        where:{
            customer_id: req.params['id'],
            cab_no:'0'
        },
        include:[{
            model:CaseType
        }]
    });

    res.render("customer/view", {
        layout: "dashboard",
        title: "View Employees",
        customer,
        all_cases

    })
});

router.post("/customer-corporate/delete", auth, async(req, res) => {
    // var case_find = await AllCase.findAll({
    //     where: {
    //         customer_id: req.body.manager_id
    //     }
    // });
    // if (case_find.length == "0")
    // {
    //     await User.destroy({
    //         where: {
    //             id: req.body.manager_id
    //         }
    //     });
    //     res.json({
    //         success: true
    //     })
    // }
    // else
    // {
    //     res.json({
    //         success: false
    //     })
    // }
    var corporate_firm = await User.findOne({
        where: {
            id: req.body.corporate_cust_id
        }
    });
    await AccountActivationKey.destroy({
        where: {
            user_id: req.body.corporate_cust_id
        }
    });
    var case_find = await Allcase.findAll({
        where: {
            firm_id: corporate_firm.firm_id
        }
    });
    if (case_find.length == "0")
    {
        await User.destroy({
            where: {
                firm_id: corporate_firm.firm_id
            }
        });
        
        await Firm.destroy({
            where: {
                id: corporate_firm.firm_id
            }
        });
        res.json({
            success: true
        })
    }
    else
    {
        res.json({
            success: false
        })
    }
});



module.exports = router;