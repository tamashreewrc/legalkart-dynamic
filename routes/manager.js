const express = require('express');
const csrf = require('csurf');
const auth = require('../middlewares/auth');
const bCrypt = require('bcrypt-nodejs');
const gravatar = require('gravatar');
const CorporateCustomerAuth = require('../middlewares/corporate_cust_auth');
const User = require('../models').user;
const State = require('../models').state;
const City = require('../models').city;
const AllCase = require('../models').all_case;
const RateList = require('../models').rate_list;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const nodemailer = require('nodemailer');

var mailjet = require('node-mailjet')
    .connect("cb9aedd05c4497d14bc18308ddfa749b", "815b7221401f44db6ad460df71b5c6a6")

var csrfProtection = csrf({
    cookie: true
})

const router = express.Router();

function removePhoneMask(phone_no) {
    var phone_no = phone_no.replace("-", "");
    phone_no = phone_no.replace(")", "");
    phone_no = phone_no.replace("(", "");
    phone_no = phone_no.replace(" ", "");
    phone_no = phone_no.replace("Rs.", "");
    phone_no = phone_no.replace(",", "");
    return phone_no;
}


router.get("/manager", auth, async (req, res) => {
    var success_add_manager = req.flash('success-add-manager')[0];
    var success_edit_manager = req.flash('success-edit-manager')[0];
    var success_del_manager = req.flash('delete-manager')[0];
    User.belongsTo(State, {
        foreignKey: 'state_id'
    });
    User.belongsTo(City, {
        foreignKey: 'city_id'
    });
    var manager = await User.findAll({
        where: {
            role_id: 5,
            firm_id: req.user.firm_id
        },
        include:[{
            model: State
        },{
            model:City
        }],
        order: [
            ['id', 'DESC']
        ]
    });
    res.render("manager/index", {
        layout: "dashboard",
        title: "Corporte Manager",
        success_add_manager,
        success_edit_manager,
        success_del_manager,
        manager
    });
});

router.get("/manager/add", auth, csrfProtection, async(req, res)=> {
    var error_add_manager = req.flash('error-add-manager')[0];
    const state = await State.findAll({
        order: [
            ['name', 'ASC'],
        ],
    });
    res.render("manager/add",{
        layout: "dashboard",
        title: "Add Corporate Manager",
        csrfToken: req.csrfToken(),
        state,
        error_add_manager
    });
});

router.post("/manager/add", auth, csrfProtection, async(req, res) => {
    var url = req.get('origin');
    const avatar = gravatar.url(req.body.email, {
        s: '150',
        r: 'pg',
        d: 'mm'
        });
    var duplicate_email_check = await User.findOne({
        where: {
            email: req.body.email
        }
    });
    if (duplicate_email_check == null)
    {
        var manager = await User.create({
            role_id: 5,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            notification_email: req.body.email,
            password: bCrypt.hashSync(req.body.password),
            mobile: removePhoneMask(req.body.mobile),
            state_id: req.body.state,
            city_id: req.body.city,
            firm_id: req.user.firm_id,
            avatar
        });
        var email_body =
            `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width">
  <meta name="format-detection" content="telephone=no">
  <!--[if !mso]>
    <!-->
      <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,600,700,800,300&subset=latin" rel="stylesheet" type="text/css">
      <!--<![endif]-->
      <title>Performlaw Password Reset</title>
      <style type="text/css">
      *{
       margin:0;
       padding:0;
       font-family:'OpenSans-Light', "Helvetica Neue", "Helvetica",Calibri, Arial, sans-serif;
       font-size:100%;
       line-height:1.6;
     }
     img{
       max-width:100%;
     }
     body{
       -webkit-font-smoothing:antialiased;
       -webkit-text-size-adjust:none;
       width:100%!important;
       height:100%;
     }
     a{
       color:#348eda;
     }
     .btn-primary{
       text-decoration:none;
       color:#FFF;
       background-color:#a55bff;
       border:solid #a55bff;
       border-width:10px 20px;
       line-height:2;
       font-weight:bold;
       margin-right:10px;
       text-align:center;
       cursor:pointer;
       display:inline-block;
     }
     .last{
       margin-bottom:0;
     }
     .first{
       margin-top:0;
     }
     .padding{
       padding:10px 0;
     }
     table.body-wrap{
       width:100%;
       padding:0px;
       /*padding-top:20px;*/
       margin:0px;
     }
     table.body-wrap .container{
       border:1px solid #f0f0f0;
     }
     table.footer-wrap{
       width:100%;
       clear:both!important;
     }
     .footer-wrap .container p{
       font-size:12px;
       color:#666;
     }
     table.footer-wrap a{
       color:#999;
     }
     .footer-content{
       margin:0px;
       padding:0px;
     }
     h1,h2,h3{
       color:#717372;
       font-family:'OpenSans-Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;
       line-height:1.2;
       margin-bottom:15px;
       margin:40px 0 10px;
       font-weight:200;
     }
     h1{
       font-family:'Open Sans Light';
       font-size:45px;
     }
     h2{
       font-size:28px;
     }
     h3{
       font-size:22px;
     }
     p,ul,ol{
       margin-bottom:10px;
       font-weight:normal;
       font-size:14px;
     }
     ul li,ol li{
       margin-left:5px;
       list-style-position:inside;
     }
     .container{
       display:block!important;
       max-width:600px!important;
       margin:0 auto!important;
       clear:both!important;
     }
     .body-wrap .container{
       padding:0px;
     }
     .content,.footer-wrapper{
       max-width:600px;
       margin:0 auto;
       padding:20px 33px 20px 37px;
       display:block;
     }
     .content table{
       width:100%;
     }
     .content-message p{
       margin:20px 0px 20px 0px;
       padding:0px;
       font-size:22px;
       line-height:38px;
       margin: 0;
       font-family:'OpenSans-Light',Calibri, Arial, sans-serif;
     }
     .content-message h1 {
      margin-top: 10px;
    }
    .preheader{
     display:none !important;
     visibility:hidden;
     opacity:0;
     color:transparent;
     height:0;
     width:0;
   }
   .logo {
    display: table;
    margin: 0 auto;
  }
</style>
</head>

<body bgcolor="#f6f6f6">
  <span class="preheader" style="display: none !important; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0;">
    You’re back in the game
  </span>

  <!-- body -->
  <table class="body-wrap" width="600">
    <tr>
      <td class="container" bgcolor="#FFFFFF">
        <!-- content -->
        <table border="0" cellpadding="0" cellspacing="0" class="contentwrapper" width="600">
          <tr>
            <td style="height:25px; background: #FF9B44;">

            </td>
          </tr>
          <tr>
            <td>
              <div class="content">
                <table class="content-message">
                  <!-- <tr>
                    <td>&nbsp;</td>
                  </tr> -->
                  <tr>
                    <td align="left">
                      <a href="#">
                        <img class="logo" src="http://139.59.92.254:3000/frontend/images/logo.png" width="250" border="0">
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td class="content-message" style="font-family:'Calibri',OpenSans-Light, Arial, sans-serif; color: #595959;">
                      <p style = "font-size: 30px; margin-bottom: 15px; margin-top: 10px; text-decoration: underline;" > Welcome to LegalKart ` + req.body.first_name + `! </p>
                      <p style = "font-size: 18px;" > A very special welcome to you ` + req.body.first_name + `, Thank you for joining Legalkart as a City Manager! </p>
                      <p style = "font-size: 18px; font-family: &quot;OpenSans-Light&quot;,Calibri,Arial,sans-serif; text-align: center;">
                          Your Username is - <span style = "color:#FF851A; font-weight: bold;"> ` + req.body.email + ` </span> </p> <p style = "font-size: 18px; font-family: &quot;OpenSans-Light&quot;,Calibri,Arial,sans-serif; text-align: center;">
                          Your Password is - <span style = "color:#FF851A; font-weight: bold;"> ` + req.body.password + ` </span> </p> <p style = "font-size: 18px;" > Please keep it secret, keep it safe! </p>

                          <p style = "font-family: 'Open Sans Light',Calibri, Arial, sans-serif; font-size:18px; line-height:26px;"> &nbsp; </p>
                      <table width="325" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td width="325" height="60" bgcolor="#FF851A" style="text-align:center; display: table;
    margin: 0 auto;">
                            <a href=` + url + ` align="center" style="display:block; font-family:'Open Sans',Calibri, Arial, sans-serif;; font-size:20px; color:#ffffff; text-align: center; line-height:60px; display:block; text-decoration:none;">Click here to Login</a>
                          </td>
                          <td>&nbsp;</td>
                          <td>&nbsp;</td>
                        </tr>
                      </table>

                      <p style="font-family: 'Open Sans','Helvetica Neue', 'Helvetica',Calibri, Arial, sans-serif; font-size:14px; line-height:26px; margin-top: 20px;">Warm Regards,<br> LegalKart!</p>
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>
            <tr>
              <td style="height:25px; background: #FF9B44;">

              </td>
            </tr>

          </table>
          <!-- /content -->
        </td>
        <td></td>
      </tr>
    </table>
    <!-- /body -->
  </body>

  </html>`

        var request = await mailjet
            .post("send")
            .request({
                "FromEmail": "bratin@wrctpl.com",
                "FromName": "LegalKart",
                "Subject": "Account Activation mail",
                "Html-part": email_body,
                "Recipients": [{
                    "Email": req.body.email
                }]
            });
        req.flash('success-add-manager', 'Manager Added Successfully');
        res.redirect('/manager');
    }
    else
    {
        req.flash('error-add-manager', 'Email Id already Exists');
        res.redirect('/manager/add');
    }
});

router.get("/manager/edit/:id", auth, csrfProtection, async(req, res) => {
    var error_edit_manager = req.flash('error-edit-manager')[0];
    var manager = await User.findOne({
        where: {
            id: req.params['id']
        }
    });
    const state = await State.findAll({
        order: [
            ['name', 'ASC'],
        ],
    });
    const city = await City.findAll({
        where: {
            state_id: manager.state_id
        },
        order: [
            ['name', 'ASC']
        ],
    });
    res.render("manager/edit",{
        layout: "dashboard",
        title: "Edit Manager",
        csrfToken: req.csrfToken(),
        manager,
        state,
        city,
        error_edit_manager
    });
});

router.post("/manager/edit/:id", auth, csrfProtection, async(req, res) => {
    var duplicate_email_edit_check = await User.findOne({
        where:{
            email: req.body.email,
            id: {
                [Op.ne]: req.params['id']
            }
        }
    })
    if (duplicate_email_edit_check== null)
    {
        var edit_manager = await User.update({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            mobile: removePhoneMask(req.body.mobile),
            state_id: req.body.state,
            city_id: req.body.city,
        },{
            where: {
                id: req.params['id']
            }
        });
        req.flash('success-edit-manager', 'Manager Updated Successfully');
        res.redirect('/manager');
    }
    else
    {
        req.flash('error-edit-manager', 'Email Id already Exists');
        res.redirect('/manager/edit/'+ req.params['id']);
    }
});

router.get("/manager/view/:id", auth, async(req, res) => {
    User.belongsTo(State, {
        foreignKey: 'state_id'
    });
    User.belongsTo(City, {
        foreignKey: 'city_id'
    });
    AllCase.belongsTo(RateList, {
        foreignKey: 'case_type_id'
    });
    var manager = await User.findOne({
        where: {
            id: req.params['id']
        },
        include:[{
            model: State
        },{
            model:City
        }]
    });
    var all_case = await AllCase.findAll({
        where: {
            customer_id: req.params['id']
        },
        include: [{
            model: RateList
        }],
        order: [
            ['id', 'DESC']
        ]
    });
    res.render("manager/view",{
        layout: "dashboard",
        title: "View Manager",
        manager,
        all_case
    });
});

router.post("/manager/delete", auth, async(req, res)=> {
    var case_find = await AllCase.findAll({
        where: {
            customer_id: req.body.manager_id
        }
    });
    if (case_find.length == "0")
    {
        await User.destroy({
            where: {
                id: req.body.manager_id
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

router.post("/add-super-admin-manager", auth, async(req, res) => {
  var manager_id = req.body.manager_id;
    for (var i = 0; i < manager_id.length; i++) {
        await User.update({
          super_admin_status: 1
        }, {
            where: {
                id: manager_id[i]
            }
        })
    }
    res.json({
        success: true
    })
});

module.exports = router;