const express = require('express');
const csrf = require('csurf');
const User = require('../models').user;
const auth = require('../middlewares/auth');
const bCrypt = require('bcrypt-nodejs');
const gravatar = require('gravatar');
const Sequelize = require('sequelize');


const nodemailer = require('nodemailer');

var mailjet = require('node-mailjet')
    .connect("cb9aedd05c4497d14bc18308ddfa749b", "815b7221401f44db6ad460df71b5c6a6")
const Op = Sequelize.Op;


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

router.get("/employees", auth, async(req, res)=> {
  var success_add_emp = req.flash('add-emp-msd')[0];
  var edit_employee = req.flash('edit_employee')[0];
  var delete_add_employee = req.flash('delete-employees')[0];

    const get_employees = await User.findAll({
        where: {
            role_id: 4
        },
        order: [
            ['id', 'DESC']
        ]
    })
    //console.log(get_employees);
    res.render("employees/index", {
        layout: "dashboard",
        title:"Employees",
        success_add_emp,
        get_employees,
        edit_employee,
        delete_add_employee


    });
});

router.get("/employee/add", auth, csrfProtection, async (req, res) => {
    var duplicate_email_employees = req.flash('duplicate_email_employee')[0];
  
    res.render("employees/addemployee", {
        layout: "dashboard",
        title: "Add Employees",
        csrfToken: req.csrfToken(),
        duplicate_email_employees,
    });
});

router.post("/employees/add", auth, csrfProtection, async(req, res) => {

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
        var employee = await User.create({
            role_id: 4,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            notification_email: req.body.email,
            password: bCrypt.hashSync(req.body.password),
            mobile: removePhoneMask(req.body.mobile),
            avatar
        });
      
//stert email

var email_body =
`	<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<style>
address { 
  display: block;
  font-style: italic;
} 
</style>
</head>
<body>

<p>An address element is displayed like this:</p>

<p > A very special welcome to you ` + req.body.first_name + `, Thank you
                      for joining PerformLaw Management Application as an Attorney! </p>
<p>Change the default CSS settings to see the effect.</p>
<p > A very special welcome to you ` + req.body.password + `, Thank you
                      for joining PerformLaw Management Application as an Attorney! </p>
<p>Change the default CSS settings to see the effect.</p>

</body>
</html>`


var url = req.protocol + '://' + req.get('host');
var request =await mailjet
        .post("send")
        .request({
            "FromEmail": "bratin@wrctpl.com",
            "FromName": "Mailjet Pilot",
            "Subject": "Your email flight plan!",
            "Text-part": "Dear passenger, welcome to Mailjet! May the delivery force be with you!",
            "Html-part": email_body,
            "Recipients": [{
                "Email": req.body.email
            }]
        });

    

//end email

        req.flash('add-emp-msd', 'Employee Added Successfully');
        res.redirect('/employees');
    }
    else
    {
        req.flash('duplicate_email_employee', 'Email Id already exist');
        res.redirect('/employees/add');
    }

});
  
//edit data

router.get("/employees/edit/:id", auth, csrfProtection, async (req, res) => {
    var duplicate_email_edit_employee = req.flash('dup-email-check-edit-employee')[0];

   
    const employee = await User.findOne({
        where: {
            id: req.params['id']
        },
    });


    res.render("employees/edit", {
        layout: "dashboard",
        title: "Edit Employee",
        csrfToken: req.csrfToken(),
        employee,
        duplicate_email_edit_employee
    });
});


//update data

router.post("/employees/edit/:id", auth, csrfProtection, async(req, res) => {
    
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
        var employee = await User.update({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            mobile: removePhoneMask(req.body.mobile)
        }, {
            where: {
                id: req.params['id']
            }
        });
      
    
        req.flash('edit_employee', 'Employee Updated Successfully');
        res.redirect('/employees');
    }
    else
    {
        ('dup-email-check-edit-employee', 'Email already exist');
        res.redirect('/employees/edit/' +req.params['id']);
    }
    
});


//delete

router.post("/employee/delete", auth, async(req, res)=> {
 
    await User.destroy({
        where: {
            id: req.body.emp_id
        }
    });
    req.flash('delete-employees', 'Success! Employees Removed Successfully');
    res.redirect('/employees');
});


//view data


router.get("/employees/view/:id", auth, async(req, res) => {
    const empl = await User.findOne({
        where: {
            id: req.params['id']
        },
     
    });

    res.render("employees/view", {
        layout: "dashboard",
        title: "View Employees",
        empl

    })
});
module.exports = router;