//module
const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const auth = require('../middlewares/auth');
const User = require('../models').user;
const lawyerAssignment = require('../models').lawyer_assignment;
const AllCase = require('../models').all_case;
const CabCaseDetail = require('../models').cab_case_detail;
const AdditionalCostCaseFile = require('../models').additional_cost_case_file;
const AdditionalAllExpence = require('../models').additional_all_expence;
const Rate = require('../models').rate;
const Fileuploads = require('../models').file_for_case;
const Court = require('../models').court;
const CaseDetails = require('../models').cab_case_detail;
const Conversation = require('../models').conversation;
const RateList = require('../models').rate_list;
const AdditionalCostCase = require('../models').additional_cost_case;
const CaseStatusCategory = require('../models').case_status_category;
const CaseStatusName = require('../models').case_status_name;
const AllCaseStatus = require('../models').all_case_status;
const AccountActivationKey = require('../models').account_activation;
const multer = require('multer');
var VerifyToken = require('../middlewares/VerifyToken');
const Invoice = require('../models').invoice;
const gravatar = require("gravatar");
const _bCrypt = require("bcrypt-nodejs");
const Lawyers = require("../models").lawyer;
const Notifications = require('../models').notification;
const InvoicePayment = require('../models').invoice_payment;
const LoginDeviceDetails = require('../models').login_device_detail;
const SendOtp = require('sendotp');
var otpGenerator = require('otp-generator');
var FCM = require('fcm-node');
var serverKey = 'AAAA_X3Aq_8:APA91bGZ-iJ-I8CTjdC5y53P3jxi3iTG0JZpLTbiZsdfksCAy5k7h02F59sVsXls8kV22GlE7K_GGd9at-AFSlbJ9Jzhn5E2Pn0C98FZB0DDr61zSLeVxeq-8NzrBLzHBLY5bqqEqv1W'; //put your server key here
var fcm = new FCM(serverKey);
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
const crypto = require("crypto");
const algorithm = "aes-256-ctr";
const password = "d6F3Efeq";
const nodemailer = require('nodemailer');
var mailjet = require('node-mailjet').connect("cb9aedd05c4497d14bc18308ddfa749b", "815b7221401f44db6ad460df71b5c6a6");
const accountSid = 'ACebc0a918935d92408750e84a3f040725';
const authToken = '9abd6938cec25311e157561e3275cc7e';
const client = require('twilio')(accountSid, authToken);

var csrfProtection = csrf({
    cookie: true
})

function encrypt(text) {
    var cipher = crypto.createCipher(algorithm, password);
    var crypted = cipher.update(text, "utf8", "hex");
    crypted += cipher.final("hex");
    return crypted;
}




//login lawyer
router.post('/login_api', async (req, res) => {

    const email = req.body.email.toLowerCase();
    const password = req.body.password;

    const user = await User.findOne({
        where: {
            email: email
        }
    });

    if (!user) {
        return res.json({
            success: false,
            code: 404,
            message: 'Username or Password is wrong.'
        });
    } else if (user) {

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch && user.role_id == '2') {

            await User.update({
                device_fcm_id:req.body.fcm_id
            },{
                where: {
                    email: email
                }
            })

            let token = jwt.sign({ email: email },'worldisfullofdevelopers', {
                expiresIn: '24h' // expires in 24 hours
            });

            return res.json({
                success: true,
                code: 200,
                message: 'Successfully Login',
                user: user,
                email: req.body.email,
                token:token
            });

        } else {
            return res.json({
                success: false,
                code: 404,
                message: 'Email or Password is wrong.'
            });
        }
    }

});


//fetch all case
router.post("/assign-challan-all-api", VerifyToken, async(req, res) => {

    const user_id = req.body.user_id;

    var assign_case = await lawyerAssignment.findAll({
        where: {
            lawyer_id: user_id
        }
    });

    all_case_id = [];

    for(var i=0; i<assign_case.length;i++)
    {
        all_case_id.push(assign_case[i].case_id)
    }

    AllCase.hasMany(CabCaseDetail, {
        foreignKey: 'case_id'
    });

    var all_case = await AllCase.findAll({
        where: {
            id: all_case_id,
            case_type_id: 7,
            case_no:"0"
        },
        include: [{
            model: CabCaseDetail
        }]
    });
    

    return res.json({
        success: true,
        code:200,
        info:all_case,
    });

});

// case conversation message fetch
router.post("/case-conversation-api", VerifyToken, async (req, res) => {

    const case_id = req.body.case_id;

    var converSactionDetails = []
    const conversation = await Conversation.findAll({
        where: {
            case_id: case_id
        },
        order: [
            ['id', 'ASC']
        ],
    });

    for (let i = 0; i < conversation.length; i++) {
        var userDetails = await User.findAll({
            where: {
                id: conversation[i].user_id
            }
        })


        converSactionDetails.push({
            'name': userDetails[0].first_name + " " + userDetails[0].last_name,
            'message': conversation[i].c_msg,
            'date': conversation[i].createdAt,
            'img': userDetails[0].avatar,
            'c_image': conversation[i].c_image,
            'extension': conversation[i].c_image.split('.').pop()
        })
    }

    var allCaseDetails = await AllCase.findOne({
        where: {
            id: case_id
        }
    });

    const caseDetails = await CaseDetails.findOne({
        where: {
            'case_id': case_id
        }
    })

    if (caseDetails != null) {
        var courtName = await Court.findOne({
            where: {
                id: caseDetails.court_id
            }
        })
    }

    const caseType = await RateList.findOne({
        where: {
            id: allCaseDetails.case_type_id
        }
    });

    const filesAll = await Fileuploads.findAll({
        where: {
            case_id: case_id
        }
    });

    var lawyer_rate = await Rate.findOne({
        where: {
            name: caseType.type_of_case
        },
        order: [
            ['id', 'DESC']
        ]
    });

    AdditionalCostCase.hasMany(AdditionalCostCaseFile, {
        foreignKey: 'additional_cost_case_id'
    });

    AdditionalCostCase.hasMany(AdditionalAllExpence, {
        foreignKey: 'additional_cost_case_id'
    });

    var AdditionalCost = await AdditionalCostCase.findOne({
        where: {
            case_id: case_id
        },
        include:[{
            model:AdditionalCostCaseFile
        },{
            model: AdditionalAllExpence
        }]
    });

    return res.json({
        success: true,
        code:200,
        conversations: converSactionDetails,
        allCaseDetails,
        caseDetails,
        courtName: courtName ? courtName : "",
        filesAll,
        caseType,
        lawyer_rate: lawyer_rate.rate_lawyers,
        AdditionalCost: AdditionalCost ? AdditionalCost : ""
    });

});

//case status
router.get("/case-status-list-api", async(req, res)=> {
    var case_stage = await CaseStatusCategory.findAll();
    var case_status_name = await CaseStatusName.findAll();

    return res.json({
        success: true,
        code:200,
        case_stage:case_stage,
        case_status_name:case_status_name
    });
});

// case status
router.post("/add-case-status-by-lawyer-api", VerifyToken, async(req, res)=> {
    var case_stage = await CaseStatusCategory.findOne({
        where: {
            id: req.body.stage
        }
    });
    var case_status_name = await CaseStatusName.findOne({
        where: {
            id: req.body.status
        }
    });
    var find_case_id = await AllCaseStatus.findOne({
        where: {
            case_id: req.body.case_id
        }
    });
    if (find_case_id == null)
    {
        await AllCaseStatus.create({
            case_id: req.body.case_id,
            case_status_id: req.body.status,
            case_status_category_id: req.body.stage,
            remarks: req.body.remarks,
            status: 0,
            user_id: req.body.user_id
        });
    }
    else
    {
        await AllCaseStatus.update({
            case_status_id: req.body.status,
            case_status_category_id: req.body.stage,
            remarks: req.body.remarks,
            status: 0,
            user_id: req.body.user_id
        },{
            where:
            {
                case_id: req.body.case_id
            }
        });
    }

    await Conversation.create({
        case_id: req.body.case_id,
        user_id: req.body.user_id,
        c_msg: "<p>Case Stage change to <b>" + case_stage.name + "</b> & Status Change to <b>" + case_status_name.name + "</b>. </p><br><p>Remarks- " + req.body.remarks+"</p>",
        remarks: "text",
        status: 0,
        c_image: "null"
    })
    res.json({
        success: true,
        code: 200
    })
});


// LAWYER REGISTRATION PAGE
router.post("/lawyer-signup-post-api", async(req, res) => {

    await User.destroy({
        where:{
            status: '0'
        }
    });

    var duplicate_email_check = await User.findOne({
        where: {
            email: req.body.email
        }
    });

    if (duplicate_email_check == null) {
        const dataOtp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });

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
            sub_role: req.body.lawyer_role,
            password: _bCrypt.hashSync(req.body.password),
            mobile: req.body.mobile,
            avatar,
            device_fcm_id:req.body.fcm_id,
            otp:dataOtp,
            status:0,
            gender:'m',
            login_first_status: 0,
            activate_email_status: 0,
        });

        var lawyers_details = await Lawyers.create({
            lawyer_id: lawyer.id
        });

        // For push notification
        client.messages
        .create({
            body: `LEGALKART:-Onetime password(OTP) ${dataOtp}`,
            from: '+19787679295',
            to: `+91${req.body.mobile}`
        })
        .then(message => console.log('This message for twilor',message.sid))
        .done();

        return res.json({
            success: true,
            code: 200,
            message: 'Registered Successfully',
            info:lawyer.id
        });

    } else {
        return res.json({
            success: false,
            code: 404,
            message: 'Email Id already exists',
        });
    }

});


var storage_additional_cost_file = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/upload_additional_cost_file');
    },
    filename: function (req, file, cb) {
        fileExt = file.mimetype.split('/')[1];
        fileName = file.originalname;
        // fileName = req.user.id + '-' + Date.now() + '.' + fileExt;
        cb(null, fileName);
    }
});


var additional_cost_file = multer({
    storage: storage_additional_cost_file
});


// case close
router.post("/case-close-by-lawyer-api", additional_cost_file.array('additional_cost_file_admin'), async (req, res) => {
    var govt_fee = [];
    var tot_rate_govt = [];
    var govt_fee_name = req.body.govt_fee_name.split(",");
    var isgovt_fee_amount = req.body.govt_fee_amount;
    var govt_fee_amount = isgovt_fee_amount.split(",");

    for (var g = 0; g < govt_fee_name.length; g++) {
        if (govt_fee_name[g] !== "") {
            var ddd = govt_fee_name[g];
            var uuu = govt_fee_amount[g];
            tot_rate_govt.push(parseInt(govt_fee_amount[g]));
            govt_fee.push({
                "govt_fee_name": ddd,
                "govt_fee_amount": uuu,
            });
        }
    }

    var total_rate = tot_rate_govt.reduce((a, b) => a + b, 0);


    var expence = [];
    var expence_name = req.body.addi_expence.split(",");
    var isexpence_amount = req.body.tot_addi_cost;
    var expence_amount = isexpence_amount.split(",");

    var tot_add_costs = []

    if (expence_name) {
        for (var d = 0; d < expence_name.length; d++) {
            if (expence_name[d] !== "") {
                var ddd = expence_name[d];
                var uuu = expence_amount[d];
                tot_add_costs.push(parseInt(expence_amount[d]))
                expence.push({
                    "expence_name": ddd,
                    "expence_amount": uuu,
                });
            }
        }
    }

    var total_add = tot_add_costs.reduce((a, b) => a + b, 0);

    var additional_cost = await AdditionalCostCase.create({
        case_id: req.body.case_ids,
        amount: total_add,
        govt_fee: total_rate,
        admin_add_fee: 0,
        status: 0,
    });


    for (let i = 0; i < req.files.length; i++) {
        await AdditionalCostCaseFile.create({
            additional_cost_case_id: additional_cost.id,
            file_name: "/upload_additional_cost_file/" + req.files[i].filename,
            status: 0
        });
    }

    for (var q = 0; q < govt_fee.length; q++) {
        const edu = await AdditionalAllExpence.create({
            additional_cost_case_id: additional_cost.id,
            name: govt_fee[q].govt_fee_name,
            amount: govt_fee[q].govt_fee_amount,
            status: 0,
            user_id: req.body.user_id
        });
    }

    if (expence.length != "0") {
        for (var e = 0; e < expence.length; e++) {
            const edu = await AdditionalAllExpence.create({
                additional_cost_case_id: additional_cost.id,
                name: expence[e].expence_name,
                amount: expence[e].expence_amount,
                status: 0,
                user_id: req.body.user_id
            });
        }
    }


    var user_detail = await User.findOne({
        where: {
            id: req.body.user_id
        }
    })

    await Notifications.create({
        name: `${user_detail.first_name} ${user_detail.last_name}`,
        remarks: 'Approve Successfully',
        status: 1,
        sender_id: user_detail.id,
        receive_id: 1,
        img: user_detail.avatar,
        link: `/case-conversation/${req.body.case_ids}`
    });

    return res.json({
        success: true,
        code: 200,
        message: 'Case Closed Successfully',
        info: req.files[0].filename
    });

});

//invoice list
router.post("/invoice-api", VerifyToken, async(req, res) => {
    var role_id = req.body.role_id;
    var user_id = req.body.user_id;

    Invoice.belongsTo(User, {
        foreignKey: 'user_id'
    });
    var whereCondition = {};
    if(role_id != "1")
    {
        whereCondition.user_id= user_id
    }
    var invoice = await Invoice.findAll({
        where: whereCondition,
        include: [{
            model:User
        }],
        order: [
            ['id', 'DESC']
        ]
    });
    res.json({
        success: true,
        code: 200,
        info:invoice
    })
});

// file upload for conversation
var storage1 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/upload_cases_file');
    },
    filename: function (req, file, cb) {
        fileExt = file.mimetype.split('/')[1];
        fileName = file.originalname;
        cb(null, fileName);
    }
});


var profile1 = multer({
    storage: storage1
});

// case conversation message and file upload
router.post("/conversation-api", profile1.single('conversationFile'), async (req, res) => {

    var conver = await Conversation.create({
        case_id: req.body.case_id,
        user_id: req.body.user_id,
        c_msg: req.body.conversation,
        remarks: 'text',
        status: 0,
        c_image: (fileName === '') ? 'null' : `/upload_cases_file/${fileName}`
    });

    fileName = ''

    var converimage = await Conversation.findOne({
        where: {
            id:conver.id
        }
    });

    res.json({
        success: true,
        code: 200,
        info:converimage.c_image
    })

});

// status change
router.post("/change-payment-status-api", VerifyToken, async(req, res) => {

    const invoice = await Invoice.findOne({
        where: {
            id:req.body.user_id
        }
    });

    await Invoice.update({
        payment_status: 2
    },{
        where: {
            id: req.body.invoice_id
        }
    });

    const user = await User.findOne({
        where: {
            id: req.body.user_id
        }
    });

    await Notifications.create({
        remarks: `Payment received for the invoice no. of ${req.body.invoice_no}`,
        receive_id: 1,
        status: 1,
        sender_id: user.id,
        img: user.avatar,
        name: `Advocate ${user.first_name} ${user.last_name}`,
        link: "/invoice"
    });

    res.json({
        code:200,
        success:true
    });

});

// invoice payment conversatin
router.post("/get-invoice-payment-deatils-api",VerifyToken, async (req, res) => {
    
    var invoice_detail = await InvoicePayment.findOne({
        where: {
            invoice_id: req.body.invoice_id
        }
    });
    var invoice = await Invoice.findOne({
        where: {
            id: req.body.invoice_id
        }
    })
    res.json({
        code:200,
        success:true,
        invoice_detail: invoice_detail,
        invoice: invoice
    });
});

//push notification
router.post("/send-push-notification", async (req, res) => {

    /*const dataOtp = otpGenerator.generate(6, {
        upperCase: false,
        specialChars: false
    });

    //push notification
    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
        to: req.body.fcm_id,
        collapse_key: 'green',

        notification: {
            title: 'LEGALCART',
            body: `LEGALKART:-Onetime password(OTP) ${dataOtp}`
        },

    };

    fcm.send(message, function (err, response) {
        if (err) {
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });*/

    // For push notification
    const dataOtp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });

    client.messages
    .create({
        body: `LEGALKART:-Onetime password(OTP) ${dataOtp}`,
        from: '+19787679295',
        to: '+918777560051'
    })
    .then(message => console.log('This message for twilor',message.sid))
    .done();

    res.json({
        code: 200,
        success: true,
    });

});

//push notification
router.post("/resend-notification", async (req, res) => {

    const dataOtp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });

    const user = await User.findOne({
        where: {
            id: req.body.user_id
        }
    });

    if (user) {
        const user = await User.update({
            otp: dataOtp,
        }, {
            where: {
                id: req.body.user_id
            }
        });
    
        client.messages
        .create({
            body: `LEGALKART:-Onetime password(OTP) ${dataOtp}`,
            from: '+19787679295',
            to: `+91${req.body.mobile}`
        })
        .then(message => console.log('This message for twilor',message.sid))
        .done();
    
        res.json({
            code: 200,
            success: true,
        });

    } else {

        res.json({
            code: 400,
            success: false,
        });
    }

});

// otp registration
router.post("/registration-by-otp", async (req, res) => {

    var activation_key = encrypt(req.body.email);
    var url = "http://139.59.92.254:3000/activate-account/" + activation_key;

    const user = await User.findOne({
        where: {
            id: req.body.user_id
        }
    });

    if (user.otp==req.body.otp) {

        // email send start
        var activation = await AccountActivationKey.create({
            user_id: req.body.user_id,
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

        var request = await mailjet.post("send").request({
            "FromEmail": "bratin@wrctpl.com",
            "FromName": "LegalKart",
            "Subject": "Account Activation mail",
            "Html-part": email_body,
            "Recipients": [{
                "Email": req.body.email
            }]
        });
        // email send end



        const user = await User.update({
            status: 1
        }, {
            where: {
                id: req.body.user_id
            }
        });

        res.json({
            code: 200,
            success: true,
            msg:"OTP match successfully"
        });

    } else {

        res.json({
            code: 400,
            success: false,
            msg:"OTP Does not match"
        });
    }
    
});


// device details
router.post("/login-device-details",VerifyToken, async (req, res) => {

    const devicedetails = await LoginDeviceDetails.findOne({
        where: {
            ip_address: req.body.ip_address

        }
    });

    if (devicedetails) {
        res.json({
            code: 400,
            success: false,
        });
    } else {

        await LoginDeviceDetails.create({
            user_id: req.body.user_id,
            ip_address: req.body.ip_address,
            platform: req.body.platform,
            device_cordova: req.body.device_cordova,
            device_model: req.body.device_model,
            device_platform: req.body.device_platform,
            device_uuid: req.body.device_uuid,
            device_version: req.body.device_version,
            device_manufacturer: req.body.device_manufacturer,
            device_isvirtual: req.body.device_isvirtual,
            device_serial: req.body.device_serial,
            status: 0
        });

        res.json({
            code: 200,
            success: true,
        });
    }

});

module.exports = router;

