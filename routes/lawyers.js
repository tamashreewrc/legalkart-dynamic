const express = require('express');
const csrf = require('csurf');
const User = require('../models').user;
const Court = require('../models').court;
const Jurisdiction = require('../models').jurisdiction;
const PacticeArea = require('../models').pacticearea;
const SubPacticeArea = require('../models').sub_pacticearea;
const City = require('../models').city;
const State = require('../models').state;
const Lawyers = require('../models').lawyer;
const Education = require('../models').education;
const CourtToLawyer = require('../models').court_to_lawyer;
const PracticeAreaToLawyer = require('../models').practice_area_to_lawyer;
const LawyerBankDetail = require('../models').lawyer_bank_detail;
const LawyerRatingsDetail = require('../models').lawyer_rating_review;
const LawyerAssign = require('../models').lawyer_assignment;
const AccountActivationKey = require('../models').account_activation;
const AllCase = require('../models').all_case;
const Ratelist = require('../models').rate_list;
const LawyerRate = require('../models').lawyer_rate;
const Firm = require("../models").firm;
const auth = require('../middlewares/auth');
const bCrypt = require('bcrypt-nodejs');
const multer = require('multer');
const gravatar = require('gravatar');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const crypto = require("crypto");
const algorithm = "aes-256-ctr";
const password = "d6F3Efeq";
const nodemailer = require('nodemailer');

var mailjet = require('node-mailjet')
    .connect("cb9aedd05c4497d14bc18308ddfa749b", "815b7221401f44db6ad460df71b5c6a6")

var csrfProtection = csrf({
    cookie: true
})

function encrypt(text) {
    var cipher = crypto.createCipher(algorithm, password);
    var crypted = cipher.update(text, "utf8", "hex");
    crypted += cipher.final("hex");
    return crypted;
}

const router = express.Router();

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/site_profile');
    },
    filename: function (req, file, cb) {
        fileExt = file.mimetype.split('/')[1];
        if (fileExt == 'jpeg') {
            fileExt = 'jpg';
        }
        fileName = req.user.id + '-' + Date.now() + '.' + fileExt;
        cb(null, fileName);
    }
});

var profile = multer({
    storage: storage
});

function removePhoneMask(phone_no) {
    var phone_no = phone_no.replace("-", "");
    phone_no = phone_no.replace(")", "");
    phone_no = phone_no.replace("(", "");
    phone_no = phone_no.replace(" ", "");
    phone_no = phone_no.replace("Rs.", "");
    phone_no = phone_no.replace(",", "");
    return phone_no;
}

router.post("/get-city", async(req, res) => {
    var city = await City.findAll({
        where: {
            state_id: req.body.state_id
        },
        order: [
            ['name', 'ASC'],
        ],
    });
    res.json({
        success: true,
        city: city
    })
});

router.get("/lawyers", auth, async(req, res)=> {
    var success_add_lawyers = req.flash('add-lawyer')[0];
    var edit_lawyers = req.flash('edit-lawyer')[0];
    var delete_add_lawyers = req.flash('delete-lawyer')[0];
    const state = await State.findAll({
        order: [
            ['name', 'ASC'],
        ],
    });
    User.hasMany(Lawyers, {
        foreignKey: 'lawyer_id'
    });
    User.belongsTo(State, {
        foreignKey: 'state_id'
    });
    User.belongsTo(City, {
        foreignKey: 'city_id'
    });
    var whereCondition = {};
    whereCondition.role_id = 2;
    if(req.query.state)
    {
        whereCondition.state_id = req.query.state;
        var city = await City.findAll({
            where: {
                state_id: req.query.state
            }
        });
    }
    if(req.query.city)
    {
        whereCondition.city_id = req.query.city;
    }
    if(req.query.Panel_member_search)
    {
        var panel_lawyer_search = []; 
        var find_P_lawyer = await Lawyers.findAll({
            where: {
                panel_member: 1
            }
        });
        for(var f=0; f< find_P_lawyer.length;f++)
        {
            panel_lawyer_search.push(find_P_lawyer[f].lawyer_id);
        }
        whereCondition.id = panel_lawyer_search;
    }

    const get_lawyer = await User.findAll({
        where: whereCondition,
        include: [{
            model: Lawyers
        }, {
            model: State
        }, {
            model: City
        }],
        order: [
            ['id', 'DESC']
        ]
    });
    var get_lawyers = [];
    for(var l=0; l<get_lawyer.length; l++)
    {
        PracticeAreaToLawyer.belongsTo(SubPacticeArea, {
            foreignKey: "sub_practice_area_id"
        });
        const lawyer_practice = await PracticeAreaToLawyer.findAll({
            where: {
                lawyer_id: get_lawyer[l].id
            },
            include: [{
                model: SubPacticeArea
            }]
        });
        var lawyer_practice_area = [];
        for (var s = 0; s < lawyer_practice.length; s++) {
            lawyer_practice_area.push(lawyer_practice[s].sub_pacticearea.name);
        }
        get_lawyers.push({
            "lawyers": get_lawyer[l],
            "lawyer_practice_area": lawyer_practice_area
        })
    }
    res.render("lawyers/index", {
        layout: "dashboard",
        title:"Lawyers",
        success_add_lawyers,
        get_lawyers,
        delete_add_lawyers,
        edit_lawyers,
        state,
        city: city ? city : '',
        state_id:req.query.state ? req.query.state : "",
        city_id:req.query.city ? req.query.city : "",
        panel_lawyer_search:req.query.Panel_member_search ? req.query.Panel_member_search : ""
    });
});

router.get("/lawyers/add", auth, csrfProtection, async (req, res) => {
    var duplicate_email_lawyer = req.flash('duplicate-email-lawyer')[0];
    const court = await Court.findAll({
        order: [
            ['name', 'ASC'],
        ],
    });
    const jurisdiction = await Jurisdiction.findAll({
        order: [
            ['name', 'ASC'],
        ],
    });
    const pacticeArea = await PacticeArea.findAll({
        order: [
            ['name', 'ASC'],
        ],
    });
    const state = await State.findAll({
        order: [
            ['name', 'ASC'],
        ],
    });
    const case_type_list = await Ratelist.findAll({
        order: [
            ['type_of_case', 'ASC'],
        ],
    });
    
    res.render("lawyers/add", {
        layout: "dashboard",
        title: "Add Lawyers",
        csrfToken: req.csrfToken(),
        court,
        jurisdiction,
        pacticeArea,
        state,
        case_type_list,
        duplicate_email_lawyer
    });
});

router.post("/get-sub-practice-area", auth, async(req, res) => {
    const sub_practice_area = await SubPacticeArea.findAll({
        where: {
            p_id: req.body.p_id
        }
    });
    res.json({
        success: true,
        sub_practice_area: sub_practice_area
    })
});

router.post("/lawyers/add", auth, csrfProtection, async(req, res) => {
    var activation_key = encrypt(req.body.email);
    var url = req.get('origin') + "/activate-account/" + activation_key;
    // var court = req.body.court;
    var rateByCaseType = [];
    var case_type_id = req.body.case_type_id;
    var rate_by_case_lawyer = req.body.rate_by_case_lawyer
    for (var d = 0; d < case_type_id.length; d++) {
        if (case_type_id[d] !== "") {
            var ddd = case_type_id[d];
            var uuu = rate_by_case_lawyer[d];
            rateByCaseType.push({
                "case_type_id": ddd,
                "rate_by_case_lawyer": uuu ? removePhoneMask(uuu) : 0
            });
        }
    }
    var court = await Court.findOne({
        where: {
            name: req.body.jurisdiction_court_name
        }
    });
    var court_id;
    if(court == null)
    {
        var add_new_court = await Court.create({
            name: req.body.jurisdiction_court_name,
        });
        court_id = add_new_court.id
    }
    else
    {
        court_id= court.id;
    }
    const avatar = gravatar.url(req.body.email, {
        s: '150',
        r: 'pg',
        d: 'mm'
        });
    // const Dob = req.body.dob ? req.body.dob.split("/") : '';
    // const practice_start = req.body.practice_start ? req.body.practice_start.split("/") : '';
    var duplicate_email_check = await User.findOne({
        where: {
            email: req.body.email
        }
    });
    if (duplicate_email_check == null)
    {
        var lawyer = await User.create({
            role_id: 2,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            notification_email: req.body.email,
            sub_role: req.body.role,
            password: bCrypt.hashSync(req.body.password),
            mobile: removePhoneMask(req.body.mobile),
            city_id: req.body.city,
            state_id: req.body.state,
            gender: req.body.gender,
            status: 1,
            login_first_status: 0,
            activate_email_status: 0,
            avatar
        });
        var lawyers_others_info = await Lawyers.create({
            lawyer_id: lawyer.id,
            dob: null,
            jurisdiction_id: 1,
            court_id: court_id,
            bar_council_id: req.body.bar_council_id,
            case_handled: 1,
            practice_start: null,
            rate: 0,
            language: null,
            address1: req.body.address1,
            address2: req.body.address2,
            address3: req.body.address3,
            city: req.body.city,
            state: req.body.state,
            bio: null,
            chember_address: null,
            status: 0
        });
        for (var e = 0; e < rateByCaseType.length; e++) {
            const rates = await LawyerRate.create({
                lawyer_id: lawyer.id,
                case_type_id: rateByCaseType[e].case_type_id,
                rate: rateByCaseType[e].rate_by_case_lawyer,
            });
        }
        // for (var c = 0; c < court.length; c++) {
        //     const court_lawyer = await CourtToLawyer.create({
        //         lawyer_id: lawyer.id,
        //         court_id: court[c],
        //         status: 0
        //     });
        // }
        var activation = await AccountActivationKey.create({
            user_id: lawyer.id,
            activation_key: activation_key,
            status: 0
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
                      <p style = "font-size: 18px;" > A very special welcome to you ` + req.body.first_name + `, Thank you for joining Legalkart as a Lawyer! </p>
                      <p style = "font-size: 18px; font-family: &quot;OpenSans-Light&quot;,Calibri,Arial,sans-serif; text-align: center;">
                          Your Username is - <span style = "color:#FF851A; font-weight: bold;"> ` + req.body.email + ` </span> </p> <p style = "font-size: 18px; font-family: &quot;OpenSans-Light&quot;,Calibri,Arial,sans-serif; text-align: center;">
                          Your Password is - <span style = "color:#FF851A; font-weight: bold;"> ` + req.body.password + ` </span> </p> <p style = "font-size: 18px;" > Please keep it secret, keep it safe! </p>

                          <p style = "font-family: 'Open Sans Light',Calibri, Arial, sans-serif; font-size:18px; line-height:26px;"> &nbsp; </p>
                      <table width="325" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td width="325" height="60" bgcolor="#FF851A" style="text-align:center; display: table;
    margin: 0 auto;">
                            <a href=` + url + ` align="center" style="display:block; font-family:'Open Sans',Calibri, Arial, sans-serif;; font-size:20px; color:#ffffff; text-align: center; line-height:60px; display:block; text-decoration:none;">Click here to activate your account</a>
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
        res.json({
            success: true,
            lawyer_id: lawyer.id
        });
    }
    else
    {
        res.json({
            success: false
        });
    }
    
    
});

router.post("/lawyers/add-practice-area", auth, async(req, res) => {
    const check_dup = await PracticeAreaToLawyer.findOne({
        where: {
            lawyer_id: req.body.lawyer_id,
            practice_area_id: req.body.p_id,
            sub_practice_area_id: req.body.sub_p_id
        }
    });
    if (check_dup == null)
    {
        var lawyer_p_id = await PracticeAreaToLawyer.create({
            lawyer_id: req.body.lawyer_id,
            practice_area_id: req.body.p_id,
            sub_practice_area_id: req.body.sub_p_id
        });
        const p_area = await PacticeArea.findOne({
            where: {
                id: req.body.p_id
            }
        });
        const sub_p_area = await SubPacticeArea.findOne({
            where: {
                id: req.body.sub_p_id
            }
        });
        res.json({
            success: true,
            lawyer_p_area_id: lawyer_p_id.id,
            p_area: p_area.name,
            sub_p_area: sub_p_area.name
        });
    }
    else
    {
        res.json({
            success: false
        });
    }
});

router.post("/lawyers/add-bank-details-photo-upload", auth, profile.single('avatar'), csrfProtection, async (req, res) => {
    const avatar1 = gravatar.url(req.body.ac_holder, {
        s: '150',
        r: 'pg',
        d: 'mm'
    });
    await User.update({
        avatar: (req.file === undefined) ? avatar1 : `/site_profile/${req.file.filename}`
    },{
        where: {
            id: req.body.law_id
        }
    });
    await LawyerBankDetail.create({
        lawyer_id: req.body.law_id,
        account_number: req.body.ac_no,
        ifsc_code: req.body.ifsc_code,
        bank_name: req.body.bank_name,
        account_holder: req.body.ac_holder,
        pan_no: req.body.ac_holder_pan_no,
        status: 0,
    });
    req.flash('add-lawyer', 'Lawyer Added Successfully');
    res.redirect('/lawyers');
});

router.get("/lawyers/view/:id", auth, async(req, res) => {
    User.hasMany(Lawyers, {
        foreignKey: 'lawyer_id'
    });
    User.hasMany(Education, {
        foreignKey: 'lawyer_id'
    });
    User.hasMany(CourtToLawyer, {
        foreignKey: 'lawyer_id'
    });
    User.hasMany(PracticeAreaToLawyer, {
        foreignKey: 'lawyer_id'
    });
    User.hasMany(LawyerBankDetail, {
        foreignKey: 'lawyer_id'
    });
    User.hasMany(LawyerRatingsDetail, {
        foreignKey: 'lawyer_id'
    });
    const lawyer = await User.findOne({
        where: {
            id: req.params['id']
        },
        include: [{
            model: Lawyers
        }, {
            model: Education
        }, {
            model: CourtToLawyer
        }, {
            model: PracticeAreaToLawyer
        }, {
            model: LawyerBankDetail
        }, {
            model: LawyerRatingsDetail
        }]
    });
    const state = await State.findById(lawyer.lawyers[0].state);
    const city = await City.findById(lawyer.lawyers[0].city);
    //const jurisdiction = await Jurisdiction.findById(lawyer.lawyers[0].jurisdiction_id);
    var court_id = [];
    for (var c = 0; c < lawyer.court_to_lawyers.length; c++)
    {
        court_id.push(lawyer.court_to_lawyers[c].court_id)
    } 
    var court = await Court.findAll({
        where: {
            id: court_id
        }
    });
    var lawyerPracticeArea = [];
    for (var p = 0; p < lawyer.practice_area_to_lawyers.length; p++) {
        var p_area = await PacticeArea.findOne({
            where: {
                id: lawyer.practice_area_to_lawyers[p].practice_area_id
            }
        });
        var sub_p_area = await SubPacticeArea.findOne({
            where: {
                id: lawyer.practice_area_to_lawyers[p].sub_practice_area_id
            }
        });
        lawyerPracticeArea.push({
            "lawyer_practice_area_id": lawyer.practice_area_to_lawyers[p].id,
            "practice_area": p_area.name,
            "sub_practice_area": sub_p_area.name,
        });
    }
    LawyerAssign.belongsTo(AllCase, {
        foreignKey: 'case_id'
    });
    var lawyer_assign = await LawyerAssign.findAll({
        where: {
            lawyer_id: req.params['id']
        },
        include:[{
            model:AllCase
        }]
    })
    var court_name = await Court.findOne({
      where: {
        id: lawyer.lawyers[0].court_id
      }
    })
    LawyerRate.belongsTo(Ratelist, {
        foreignKey: 'case_type_id'
    });
    const lawyer_rate = await LawyerRate.findAll({
      where: {
        lawyer_id: req.params['id']
      },
      include: [{
        model:Ratelist
      }]
    });
    res.render("lawyers/view", {
        layout: "dashboard",
        title: "View Lawyer",
        lawyer,
        state,
        city,
        court,
        lawyerPracticeArea,
        lawyer_assign,
        lawyer_rate,
        court_name
    })
});

router.get("/lawyers/edit/:id", auth, csrfProtection, async (req, res) => {
    var duplicate_email_edit_lawyer = req.flash('dup-email-check-edit-lawyer')[0];
    const court = await Court.findAll({
        order: [
            ['name', 'ASC'],
        ],
    });
    const jurisdiction = await Jurisdiction.findAll({
        order: [
            ['name', 'ASC'],
        ],
    });
    const pacticeArea = await PacticeArea.findAll({
        order: [
            ['name', 'ASC'],
        ],
    });
    const state = await State.findAll({
        order: [
            ['name', 'ASC'],
        ],
    });
    User.hasMany(Lawyers, {
        foreignKey: 'lawyer_id'
    });
    User.hasMany(Education, {
        foreignKey: 'lawyer_id'
    });
    User.hasMany(CourtToLawyer, {
        foreignKey: 'lawyer_id'
    });
    User.hasMany(PracticeAreaToLawyer, {
        foreignKey: 'lawyer_id'
    });
    User.hasMany(LawyerBankDetail, {
        foreignKey: 'lawyer_id'
    });
    const lawyer = await User.findOne({
        where: {
            id: req.params['id']
        },
        include: [{
            model: Lawyers
        },{
            model: Education
        },{
            model: CourtToLawyer
        }, {
            model: PracticeAreaToLawyer
        }, {
            model: LawyerBankDetail
        }]
    });
    var court_name = await Court.findOne({
      where: {
        id: lawyer.lawyers[0].court_id
      }
    })
    const city = await City.findAll({
        where: {
            state_id: lawyer.lawyers[0].state
        }
    });
    const subPracticeArea = await SubPacticeArea.findAll({
        where: {
            p_id: lawyer.lawyers[0].practice_area_id
        }
    });
    var res_court = JSON.parse(JSON.stringify(lawyer.court_to_lawyers));
    var court_arr = [];
    for (var i = 0; i < res_court.length; i++) {
        court_arr.push(res_court[i].court_id);
    }
    var lawyerPracticeArea = [];
    for (var p = 0; p < lawyer.practice_area_to_lawyers.length; p++)
    {
        var p_area = await PacticeArea.findOne({
            where: {
                id: lawyer.practice_area_to_lawyers[p].practice_area_id
            }
        });
        var sub_p_area = await SubPacticeArea.findOne({
            where: {
                id: lawyer.practice_area_to_lawyers[p].sub_practice_area_id
            }
        });
        lawyerPracticeArea.push({
            "lawyer_practice_area_id": lawyer.practice_area_to_lawyers[p].id,
            "practice_area": p_area.name,
            "sub_practice_area": sub_p_area.name,
        });
    }
    LawyerRate.belongsTo(Ratelist, {
        foreignKey: 'case_type_id'
    });
    const lawyer_rate = await LawyerRate.findAll({
      where: {
        lawyer_id: req.params['id']
      },
      include: [{
        model:Ratelist
      }]
    });
    const case_type_list = await Ratelist.findAll({
        order: [
            ['type_of_case', 'ASC'],
        ],
    });
    res.render("lawyers/edit", {
        layout: "dashboard",
        title: "Edit Lawyers",
        csrfToken: req.csrfToken(),
        lawyer,
        court,
        jurisdiction,
        pacticeArea,
        subPracticeArea,
        state,
        city,
        duplicate_email_edit_lawyer,
        lawyerPracticeArea,
        court_arr,
        court_name,
        lawyer_rate,
        case_type_list,
        lawyer_rate_length : lawyer_rate.length,
    });
});

router.post("/lawyers/edit/:id", auth, csrfProtection, async(req, res) => {
    //var dateOB = req.body.dob.trim();
    //var court = req.body.court;
    var rateByCaseType = [];
    var case_type_id = req.body.case_type_id;
    var rate_by_case_lawyer = req.body.rate_by_case_lawyer
    for (var d = 0; d < case_type_id.length; d++) {
        if (case_type_id[d] !== "") {
            var ddd = case_type_id[d];
            var uuu = rate_by_case_lawyer[d];
            rateByCaseType.push({
                "case_type_id": ddd,
                "rate_by_case_lawyer": uuu ? removePhoneMask(uuu) : 0
            });
        }
    }
    var court = await Court.findOne({
        where: {
            name: req.body.jurisdiction_court_name
        }
    });
    var court_id;
    if(court == null)
    {
        var add_new_court = await Court.create({
            name: req.body.jurisdiction_court_name,
        });
        court_id = add_new_court.id
    }
    else
    {
        court_id= court.id;
    }
    // const Dob = dateOB ? dateOB.split("/") : '';
    // const practice_start = req.body.practice_start ? req.body.practice_start.split("/") : '';
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
        var lawyer = await User.update({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            sub_role: req.body.role,
            mobile: removePhoneMask(req.body.mobile),
            city_id: req.body.city,
            state_id: req.body.state,
            gender: req.body.gender
        }, {
            where: {
                id: req.params['id']
            }
        });
        var lawyers_others_info = await Lawyers.update({
            dob: null,
            jurisdiction_id: 1,
            court_id: court_id,
            bar_council_id: req.body.bar_council_id,
            case_handled: 1,
            practice_start: null,
            rate: 0,
            address1: req.body.address1,
            address2: req.body.address2,
            address3: req.body.address3,
            state: req.body.state,
            city: req.body.city,
            language: null,
            bio: null,
            chember_address: null
        }, {
            where: {
                lawyer_id: req.params['id']
            }
        });
        await LawyerRate.destroy({
            where: {
                lawyer_id: req.params['id']
            }
        })
        for (var e = 0; e < rateByCaseType.length; e++) {
          const rates = await LawyerRate.create({
              lawyer_id: req.params['id'],
              case_type_id: rateByCaseType[e].case_type_id,
              rate: rateByCaseType[e].rate_by_case_lawyer,
          });
      }
        res.json({
            success: true
        });
    }
    else
    {
        res.json({
            success: false
        })
    }
    
});

router.post("/lawyers/edit-bank-details-photo-upload", auth, profile.single('avatar'), csrfProtection, async (req, res) => {
    const avatar1 = gravatar.url(req.body.ac_holder, {
        s: '150',
        r: 'pg',
        d: 'mm'
    });
    await User.update({
        avatar: req.user.role_id == 1 ? (req.file === undefined) ? req.body.old_img : `/site_profile/${req.file.filename}`   : (req.file === undefined) ? req.user.avatar : `/site_profile/${req.file.filename}`
    }, {
        where: {
            id: req.body.law_id
        }
    });
    await LawyerBankDetail.destroy({
        where: {
            lawyer_id: req.body.law_id
        }
    });
    await LawyerBankDetail.create({
        lawyer_id: req.body.law_id,
        account_number: req.body.ac_no,
        ifsc_code: req.body.ifsc_code,
        bank_name: req.body.bank_name,
        account_holder: req.body.ac_holder,
        pan_no: req.body.ac_holder_pan_no,
        status: 0,
    });
    if(req.user.role_id == 2)
    {
        if(req.user.login_first_status == "0")
        {
          await User.update({
            login_first_status: 1
          }, {
            where: {
              id: req.user.id
            }
          })
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
                          <p style = "font-size: 30px; margin-bottom: 15px; margin-top: 10px; text-decoration: underline;" > Welcome to LegalKart ` + req.user.first_name + `! </p>
                          <p>Thank you for joining our site. Your account is now active.</p>
                          <p>Please go ahead and navigate around your account.</p>
                          <p>Let me know if you have further questions, I am here to help.</p>
                          <p>Enjoy the rest of your day!</p>
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
                "Subject": "Registration Successful",
                "Html-part": email_body,
                "Recipients": [{
                    "Email": req.user.email
                }]
            });
        }
        
        req.flash('edit-lawyer-profile', 'Profile Updated Successfully');
        res.redirect('/dashboard');
    }
    else
    {
        req.flash('edit-lawyer', 'Lawyer Updated Successfully');
        res.redirect('/lawyers');
    }
});

router.get("/lawyer/delete-practice-area/:id", auth, async(req, res) => {
    await PracticeAreaToLawyer.destroy({
        where: {
            id: req.params['id']
        }
    });
    res.json({
        success: true
    });
});

router.post("/lawyers/delete", auth, async(req, res)=> {
    await Education.destroy({
        where: {
            lawyer_id: req.body.lawyers_id
        }
    });
    await CourtToLawyer.destroy({
        where: {
            lawyer_id: req.body.lawyers_id
        }
    });
    await PracticeAreaToLawyer.destroy({
        where: {
            lawyer_id: req.body.lawyers_id
        }
    });
    await LawyerBankDetail.destroy({
        where: {
            lawyer_id: req.body.lawyers_id
        }
    });
    await AccountActivationKey.destroy({
        where: {
            user_id: req.body.lawyers_id
        }
    });
    await LawyerRate.destroy({
        where: {
            lawyer_id: req.body.lawyers_id
        }
    });
    await Lawyers.destroy({
        where: {
            lawyer_id: req.body.lawyers_id
        }
    });
    await User.destroy({
        where: {
            id: req.body.lawyers_id
        }
    });
    req.flash('delete-lawyer', 'Success! Lawyer Removed Successfully');
    res.redirect('/lawyers');
});

router.post("/lawyer/add-reviews-ratings", auth, async(req, res)=> {
    var add_review = await LawyerRatingsDetail.create({
        lawyer_id: req.body.lawyer_id,
        name: req.body.add_name,
        reviews: req.body.add_review,
        ratings: req.body.add_rating,
        publish_status: 0,
        status: 0
    });
    var fetch_review = await LawyerRatingsDetail.findOne({
        where: {
            id: add_review.id
        }
    });
    res.json({
        success: true,
        fetch_review: fetch_review
    })
});

router.post("/lawyers/review-ratings/delete", auth, async(req, res)=> {
    await LawyerRatingsDetail.destroy({
        where: {
            id: req.body.review_id
        }
    });
    res.json({
        success: true,
        id: req.body.review_id
    });
});

router.post("/lawyer-reviews-publish-status", auth, async(req, res)=> {
    await LawyerRatingsDetail.update({
        publish_status: 0
    }, {
        where: {
            publish_status: 1
        }
    });
    var lawyer_review_id = req.body.check_publish;
    for (var i = 0; i < lawyer_review_id.length; i++) {
        await LawyerRatingsDetail.update({
            publish_status: 1
        }, {
            where: {
                id: lawyer_review_id[i]
            }
        })
    }
    res.json({
        success: true
    })
});

router.post("/add-lawyer-panel-member", auth, async (req, res) => {
    // await Lawyers.update({
    //     panel_member: 0
    // }, {
    //     where: {
    //         panel_member: 1
    //     }
    // });
    var lawyer_id = req.body.check_publish;
    for (var i = 0; i < lawyer_id.length; i++) {
        await Lawyers.update({
            panel_member: 1
        }, {
            where: {
                lawyer_id: lawyer_id[i]
            }
        })
    }
    res.json({
        success: true
    })
});

router.get("/edit-lawyer-profile", auth, csrfProtection, async(req, res) => {
    const court = await Court.findAll({
        order: [
            ['name', 'ASC'],
        ],
    });
    const jurisdiction = await Jurisdiction.findAll({
        order: [
            ['name', 'ASC'],
        ],
    });
    const pacticeArea = await PacticeArea.findAll({
        order: [
            ['name', 'ASC'],
        ],
    });
    const state = await State.findAll({
        order: [
            ['name', 'ASC'],
        ],
    });
    User.hasMany(Lawyers, {
        foreignKey: 'lawyer_id'
    });
    User.hasMany(Education, {
        foreignKey: 'lawyer_id'
    });
    User.hasMany(CourtToLawyer, {
        foreignKey: 'lawyer_id'
    });
    User.hasMany(PracticeAreaToLawyer, {
        foreignKey: 'lawyer_id'
    });
    User.hasMany(LawyerBankDetail, {
        foreignKey: 'lawyer_id'
    });
    const lawyer = await User.findOne({
        where: {
            id: req.user.id
        },
        include: [{
            model: Lawyers
        },{
            model: Education
        },{
            model: CourtToLawyer
        }, {
            model: PracticeAreaToLawyer
        }, {
            model: LawyerBankDetail
        }]
    });
    const city = await City.findAll({
        where: {
            state_id: lawyer.lawyers[0].state
        }
    });
    const subPracticeArea = await SubPacticeArea.findAll({
        where: {
            p_id: lawyer.lawyers[0].practice_area_id
        }
    });
    var res_court = JSON.parse(JSON.stringify(lawyer.court_to_lawyers));
    var court_arr = [];
    for (var i = 0; i < res_court.length; i++) {
        court_arr.push(res_court[i].court_id);
    }
    var lawyerPracticeArea = [];
    for (var p = 0; p < lawyer.practice_area_to_lawyers.length; p++)
    {
        var p_area = await PacticeArea.findOne({
            where: {
                id: lawyer.practice_area_to_lawyers[p].practice_area_id
            }
        });
        var sub_p_area = await SubPacticeArea.findOne({
            where: {
                id: lawyer.practice_area_to_lawyers[p].sub_practice_area_id
            }
        });
        lawyerPracticeArea.push({
            "lawyer_practice_area_id": lawyer.practice_area_to_lawyers[p].id,
            "practice_area": p_area.name,
            "sub_practice_area": sub_p_area.name,
        });
    }
    var court_name = await Court.findOne({
          where: {
            id: lawyer.lawyers[0].court_id
          }
        })
    LawyerRate.belongsTo(Ratelist, {
        foreignKey: 'case_type_id'
    });
    const lawyer_rate = await LawyerRate.findAll({
      where: {
        lawyer_id: req.user.id
      },
      include: [{
        model:Ratelist
      }]
    });
    const case_type_list = await Ratelist.findAll({
        order: [
            ['type_of_case', 'ASC'],
        ],
    });
    res.render("lawyers/edit_profile", {
        layout: "dashboard",
        title: "Edit Profile",
        csrfToken: req.csrfToken(),
        lawyer,
        court,
        jurisdiction,
        pacticeArea,
        subPracticeArea,
        state,
        city,
        lawyerPracticeArea,
        court_arr,
        court_name,
        lawyer_rate,
        case_type_list,
        lawyer_rate_length : lawyer_rate.length,
    });
});

// Fronend Lawyer Sign up

router.post("/lawyer-signup-post", csrfProtection, async(req, res) => {
    var activation_key = encrypt(req.body.email);
    var url = req.get('origin') + "/activate-account/" + activation_key;
    var duplicate_email_check = await User.findOne({
        where: {
            email: req.body.email
        }
    });
    if (duplicate_email_check == null)
    {
        const avatar = gravatar.url(req.body.email, {
            s: '150',
            r: 'pg',
            d: 'mm'
        });
        var lawyer = await User.create({
            role_id: 2,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            notification_email: req.body.email,
            sub_role: req.body.lawyer_role,
            password: bCrypt.hashSync(req.body.password),
            mobile: req.body.mobile_no,
            status: 1,
            login_first_status: 0,
            activate_email_status: 0,
            avatar
        });
        var lawyers_details = await Lawyers.create({
            lawyer_id: lawyer.id,
            dob: new Date(),
            practice_start: new Date()
        });
        var activation = await AccountActivationKey.create({
            user_id: lawyer.id,
            activation_key: activation_key,
            status: 0
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
                      <p style = "font-size: 18px;" > A very special welcome to you ` + req.body.first_name + `, Thank you for joining Legalkart as a Lawyer! </p>
                      <table width="325" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td width="325" height="60" bgcolor="#FF851A" style="text-align:center; display: table;
    margin: 0 auto;">
                            <a href=` + url + ` align="center" style="display:block; font-family:'Open Sans',Calibri, Arial, sans-serif;; font-size:20px; color:#ffffff; text-align: center; line-height:60px; display:block; text-decoration:none;">Click here to activate your account</a>
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
        req.flash('signup-lawyer', ' Registered Successful. Please cheack your email and activate your account');
        res.redirect('/');
    }
    else
    {
        req.flash('signup-lawyer-dup-mail', ' Email Id already Exists');
        res.redirect('/lawyer-signup');
    }
});

router.post("/forgot-password", async(req, res) => {
    if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
        req.flash('forgotPassMsg', 'Please select captcha');
        res.redirect("/forgot-password");
    }
    else
    {
        var activation_key = encrypt(req.body.email+new Date());
        var url = req.get('origin') + "/activate-account/" + activation_key;
        var duplicate_email_check = await User.findOne({
            where: {
                notification_email: req.body.email
            }
        });
        if (duplicate_email_check != null)
        {
            var activation = await AccountActivationKey.create({
                user_id: duplicate_email_check.id,
                activation_key: activation_key,
                status: 2
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
        <title>Legalkart Password Reset</title>
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
                        <p style = "font-size: 30px; margin-bottom: 15px; margin-top: 10px; text-decoration: underline;"> Hi, ` + duplicate_email_check.first_name + " " + duplicate_email_check.last_name + `! </p>
                        <p style = "font-size: 18px;"> You are receiving this email because we received a password reset request for your account. </p>
                        <table width="325" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                            <td width="325" height="60" bgcolor="#FF851A" style="text-align:center; display: table;
        margin: 0 auto;">
                                <a href=` + url + ` align="center" style="display:block; font-family:'Open Sans',Calibri, Arial, sans-serif;; font-size:20px; color:#ffffff; text-align: center; line-height:60px; display:block; text-decoration:none;">Click here to reset your password</a>
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
                "Subject": "Reset Password",
                "Html-part": email_body,
                "Recipients": [{
                    "Email": req.body.email
                }]
            });
            req.flash('signup-lawyer', ' Please cheack your email and reset your password');
            res.redirect('/');
        }
        else
        {
            req.flash('forgotPassMsg', 'Email ID does not exists');
            res.redirect('/forgot-password');
        }
    }
});

router.get("/activate-account/:key", async(req, res)=> {
    var activation_user = await AccountActivationKey.findOne({
        where: {
            activation_key: req.params['key'],       
        }
    })
    if (activation_user.status == 0)
    {
        var user = await User.update({
            activate_email_status: 1
        },{
            where: {
                id: activation_user.user_id
            }
        });
        var activateAccnt = await AccountActivationKey.update({
            status: 1
        },{
            where: {
                id: activation_user.id
            }
        });
        req.flash('signup-lawyer', 'Account Activated Successfully. Please Login');
        res.redirect("/");
    }
    else if(activation_user.status == 2)
    {
        res.render("reset_password_screen",{
            user_id : activation_user.user_id,
            key:req.params['key']
        });
    }
    else if(activation_user.status == 1)
    {
        req.flash('loginMessage', 'Link Already Used.');
        res.redirect("/");
    }
});

router.post("/reset-password-user", async(req, res) => {
    var url = req.get('origin') + "/";
    await User.update({
        password: bCrypt.hashSync(req.body.new_password)
    },
    {
        where: {
        id: req.body.user_id
        }
    });
    var activateAccnt = await AccountActivationKey.update({
        status: 1
    },{
        where: {
            activation_key: req.body.link_key
        }
    });
    var user_detail = await User.findOne({
        where: {
            id: req.body.user_id
        }
    })
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
                          <p style = "font-size: 30px; margin-bottom: 15px; margin-top: 10px; text-decoration: underline;" > Congratulations! </p>
                          <p>Your password has been changed successfully.</p>
                          <table width="325" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                            <td width="325" height="60" bgcolor="#FF851A" style="text-align:center; display: table;
        margin: 0 auto;">
                                <a href=` + url + ` align="center" style="display:block; font-family:'Open Sans',Calibri, Arial, sans-serif;; font-size:20px; color:#ffffff; text-align: center; line-height:60px; display:block; text-decoration:none;">Click here to login</a>
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
                "Subject": "Password Reset Successfully",
                "Html-part": email_body,
                "Recipients": [{
                    "Email": user_detail.email
                }]
            });
    req.flash('signup-lawyer', 'Your password has been reset successfully. Please Login');
    res.redirect("/");
});


router.post("/register-details", csrfProtection, async (req, res) => {
    var activation_key = encrypt(req.body.email);
    var url = req.get('origin') + "/activate-account/" + activation_key;
    const avatar = gravatar.url(req.body.email, {
        s: "150",
        r: "pg",
        d: "mm"
    });

    var duplicate_email_check = await User.findOne({
        where: {
            email: req.body.email
        }
    });

    if (duplicate_email_check == null) {
        if (req.body.role_type == "C") {
            var firms = await Firm.create({
                name: req.body.firmdelatis,
                status: 0,
                image: avatar
            });
        }

        var cust = await User.create({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            password: bCrypt.hashSync(req.body.r_password),
            mobile: req.body.mobile_no,
            role_id: 3,
            firm_id: firms.id ? firms.id : 0,
            sub_role: req.body.role_type,
            gender: req.body.gender,
            activate_email_status: 0,
            avatar: avatar
        });
        var activation = await AccountActivationKey.create({
            user_id: cust.id,
            activation_key: activation_key,
            status: 0
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
                      <p style = "font-size: 18px;" > A very special welcome to you ` + req.body.first_name + `, Thank you for joining Legalkart as a corporate manager! </p>
                      <table width="325" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td width="325" height="60" bgcolor="#FF851A" style="text-align:center; display: table;
    margin: 0 auto;">
                            <a href=` + url + ` align="center" style="display:block; font-family:'Open Sans',Calibri, Arial, sans-serif;; font-size:20px; color:#ffffff; text-align: center; line-height:60px; display:block; text-decoration:none;">Click here to activate your account</a>
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

        req.flash("signup-lawyer", "Registered Successful. Please cheack your email and activate your account");
        res.redirect("/");
    } else {
        req.flash("duplicate-email-lawyer", "Email Id already exist");
        res.redirect("/register");
    }
});

router.post("/add-court-by-lawyers/add", auth, async(req, res)=> {
  var str = req.body.court_name_add;
  str = str.toLowerCase().replace(/\b[a-z]/g, function (letter) {
    return letter.toUpperCase();
  });
  var duplicate_check = await Court.findOne({
    where: {
      name: str
    }
  });
  if (duplicate_check) 
  {
    res.json({
      success: false
    });
  }
  else
  {
    await Court.create({
      name: str,
    })
    res.json({
      success: true
    });
  }
})


module.exports = router;