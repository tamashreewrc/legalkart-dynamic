const express = require("express");
const passport = require("passport");
const csrf = require("csurf");
const bCrypt = require("bcrypt-nodejs");
const User = require("../models").user;
const Firm = require("../models").firm;
const Role = require("../models").role;
const Notifications = require("../models").notification;
const StampPaper = require("../models").stamp_paper;
const Court = require("../models").court;
const Jurisdiction = require("../models").jurisdiction;
const PacticeArea = require("../models").pacticearea;
const SubPacticeArea = require("../models").sub_pacticearea;
const City = require("../models").city;
const State = require("../models").state;
const Lawyers = require("../models").lawyer;
const Education = require("../models").education;
const CourtToLawyer = require("../models").court_to_lawyer;
const ContactPerson = require("../models").contact_person;
const Customer = require("../models").customer;
const PracticeAreaToLawyer = require("../models").practice_area_to_lawyer;
const LawyerBankDetail = require("../models").lawyer_bank_detail;
const LawyerRatingsDetail = require("../models").lawyer_rating_review;
const AllCase = require("../models").all_case;
const RateList = require("../models").rate_list;
const Invoice = require("../models").invoice;
const Rate = require("../models").rate;
const LawyerContact = require("../models").lawyer_contact;
const CaseStatusCategory = require('../models').case_status_category;
const CaseStatusName = require('../models').case_status_name;
const AllCaseStatus = require('../models').all_case_status;
const lawyerAssignment = require('../models').lawyer_assignment;
const Conversation = require('../models').conversation;
const auth = require("../middlewares/auth");
const multer = require("multer");
const gravatar = require("gravatar");
const headerMenu = require("../middlewares/frontend_header");
const Razorpay = require("razorpay");
const CabCaseDetail = require('../models').cab_case_detail;
const Fileuploads = require('../models').file_for_case;
const MactCaseDetail = require('../models').mact_case_detail;
//var localStorage = require("localStorage");
const store = require("store");
var moment = require('moment');
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const { Opt } = require('sequelize')

var csrfProtection = csrf({
  cookie: true
});

var instance = new Razorpay({
  key_id: "rzp_test_WfrWOoshouTkLs",
  key_secret: "wDEGPAgqkOiGeFOtZxHzUNUs"
});

const router = express.Router();

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/site_profile");
  },
  filename: function (req, file, cb) {
    fileExt = file.mimetype.split("/")[1];
    if (fileExt == "jpeg") {
      fileExt = "jpg";
    }
    fileName = req.user.id + "-" + Date.now() + "." + fileExt;
    cb(null, fileName);
  }
});

var profile = multer({
  storage: storage
});

var storage1 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/logo");
  },
  filename: function (req, file, cb) {
    fileExt = file.mimetype.split("/")[1];
    if (fileExt == "jpeg") {
      fileExt = "jpg";
    }
    fileName = req.user.id + "-" + Date.now() + "." + fileExt;
    cb(null, fileName);
  }
});

var profile1 = multer({
  storage: storage1
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

router.get("/get-firm-name-header", async (req, res) => {
  var firm_name = await Firm.findOne({
    where:
    {
      id: req.user.firm_id
    }
  });
  res.json({
    firm_name: firm_name
  })
});

router.get("/register", csrfProtection, async (req, res) => {
  var duplicate_email_lawyer = req.flash("duplicate-email-lawyer")[0];
  res.render("register", {
    title: "Register",
    csrfToken: req.csrfToken(),
    duplicate_email_lawyer
  });
});



router.get("/", headerMenu, csrfProtection, async (req, res) => {
  
  var msg = req.flash("loginMessage")[0];
  var success_password_message = req.flash("success-password-message")[0];
  var success_signup_lawyers = req.flash("signup-lawyer")[0];
  var state = await State.findAll();
  if (req.user) {
    res.redirect("/dashboard");
  } else {
    res.render("login", {
      layout: "frontend",
      title: "Login",
      message: msg,
      success_password_message,
      success_signup_lawyers,
      csrfToken: req.csrfToken(),
      state
    });
  }
});

router.post(
  "/admin",
  csrfProtection,
  passport.authenticate("local-login", {
    failureRedirect: "/",
    failureFlash: true
  }),
  async (req, res) => {
    if (req.user.login_first_status == "0") {
      if (req.user.role_id == "2") {
        res.redirect("/edit-lawyer-profile")
      }
      else {
        res.redirect("/dashboard");
      }
    }
    else {
      res.redirect("/dashboard");
    }

    if (req.body.remember_me) {
      req.session.cookie.maxAge = 1000 * 60 * 3;
    } else {
      req.session.cookie.expires = false;
    }
  }
);

router.get("/logout", auth, async(req, res) => {
  if(req.user.actual_user_id)
  {
    await User.update({
      actual_user_id: 0
    },{
      where: 
      {
        actual_user_id: req.user.actual_user_id
      }
    })
  }
  req.logout();
  res.redirect("/");
});

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

router.get("/dashboard", auth, async (req, res) => {
  var edit_lawyers_profile = req.flash("edit-lawyer-profile")[0];
  // STARTS TOTAL SALES
  Firm.hasMany(AllCase, {
    foreignKey: "firm_id"
  });
  var firm_case = await Firm.findAll({
    include: [
      {
        model: AllCase
      }
    ]
  });
  var firm_sales = [];
  for (let i = 0; i < firm_case.length; i++) {
    var total_rate = [];
    for (var j = 0; j < firm_case[i].all_cases.length; j++) {
      var case_type = await RateList.findOne({
        where: {
          id: firm_case[i].all_cases[j].case_type_id
        }
      });
      var rate = await Rate.findOne({
        where: {
          name: case_type.type_of_case
        },
        order: [["id", "DESC"]]
      });
      if (rate !== null) {
        total_rate.push(parseInt(rate.rate));
      }
    }
    var total_sales_rate = total_rate.reduce((a, b) => a + b, 0);
    firm_sales.push({
      firm_name: firm_case[i].name,
      cases: firm_case[i].all_cases.length,
      tot_rate: total_sales_rate
    });
  }
  // ENDS TOTAL SALES

  // STARTS PAYMENT RELEASED
  Invoice.belongsTo(User, {
    foreignKey: "user_id"
  });
  var invoice = await Invoice.findAll({
    where: {
      i_o_status: "I",
      payment_status: {
        [Op.ne]: 2
      }
    },
    include: [
      {
        model: User
      }
    ],
    order: [["id", "DESC"]]
  });
  // ENDS PAYMENT RELEASED
  // STARTS LAWYERS REQ

  var lawyer = await User.findAll({
    where: {
      role_id: 2
    },
    limit: 6,
    order: [["id", "DESC"]]
  });

  // ENDS LAWYERS REQ

  // STARTS LAWYERS DASHBOARD SECTION

  //Starts Enquiry

  const lawyer_enq = await LawyerContact.findAll({
    where: {
      lawyer_id: req.user.id
    },
    order: [["id", "DESC"]]
  });

  //Ends Enquiry

  // ENDS LAWYERS DASHBOARD SECTION

  // STARTS CORPORATE CUSTOMER DASHBOARD SECTION

  //Starts Enquiry

  //Ends Enquiry

  // ENDS CORPORATE CUSTOMER DASHBOARD SECTION
  var whereCondition = {};
  var whereConditionCase = {};
  if (req.user.role_id == "2") {
    whereCondition.user_id = req.user.id
  } else if (req.user.role_id == "3") {
    if (req.user.sub_role == "C") {
      whereCondition.firm_id = req.user.firm_id
    }
  } else if (req.user.role_id == "5") {
    whereCondition.customer_id = req.user.id
  }

  if (req.user.role_id == "3") {
    if (req.user.sub_role == "C") {
      whereConditionCase.firm_id = req.user.firm_id
    }
  } else if (req.user.role_id == "5") {
    whereConditionCase.customer_id = req.user.id
  }
  else if (req.user.role_id == "2") {
    var lawyer_assignment = await lawyerAssignment.findAll({
      where:
      {
        lawyer_id: req.user.id
      },
      attributes: ["case_id"]
    });
    var caseArr = [];
    for (var l = 0; l < lawyer_assignment.length; l++) {
      caseArr.push(lawyer_assignment[l].case_id);
    }
    whereConditionCase.id = caseArr
  }
  AllCaseStatus.belongsTo(AllCase, {
    foreignKey: 'case_id'
  });
  AllCaseStatus.belongsTo(CaseStatusName, {
    foreignKey: 'case_status_id'
  });
  AllCaseStatus.belongsTo(CaseStatusCategory, {
    foreignKey: 'case_status_category_id'
  });
  var case_status = await AllCaseStatus.findAll({
    where: whereCondition,
    include: [{
      model: AllCase,
      where: whereConditionCase
    }, {
      model: CaseStatusName
    }, {
      model: CaseStatusCategory
    }],
    order: [
      ["id", "DESC"]
    ]
  });
  var noti = await Notifications.findAll({
    where: {
      receive_id: req.user.id,
      createdAt: {
        $gte: moment().subtract(2, 'days').toDate()
      }
    }
  });

  var msgCondition = {};
  if(req.user.role_id == "3")
  {
    msgCondition.firm_id= req.user.firm_id
  }
  else if(req.user.role_id == "5")
  {
    msgCondition.customer_id= req.user.id
  }
  else if(req.user.role_id == "2")
  {
    var law_aagn = await lawyerAssignment.findAll({
      where: {
        lawyer_id: req.user.id
      }
    });
    var cases = [];
    for(var l=0;l<law_aagn.length;l++)
    {
      cases.push(law_aagn[l].case_id)
    }
    msgCondition.id = cases
  }
  msgCondition.status= {
    [Op.ne]: 0
  }
  // console.log(msgCondition);
  var find_case = await AllCase.findAll({
    where: msgCondition,
    order: [['createdAt', 'DESC']]
  });
  var msg_case_id = [];
  for (var i = 0; i < find_case.length; i++) {
    msg_case_id.push(find_case[i].id);
  }
  var new_msg = await Conversation.findAll({
    where: {
      case_id : msg_case_id,
      status: 0,
      user_id: {
        [Op.ne]: req.user.id
      }
    }
  })


  res.render("dashboard", {
    layout: "dashboard",
    title: "Dashboard",
    edit_lawyers_profile,
    firm_sales,
    invoice,
    lawyer,
    lawyer_enq,
    case_status,
    total_new_case: noti,
    new_msg : new_msg.length != 0 ? `${new_msg.length} new messages` : '',
    firm_case
  });

});


router.get("/total-message-count", async(req, res) =>{
  var msgCondition = {};
  if(req.user.role_id == "3")
  {
    msgCondition.firm_id= req.user.firm_id
  }
  else if(req.user.role_id == "5")
  {
    msgCondition.customer_id= req.user.id
  }
  else if(req.user.role_id == "2")
  {
    var law_aagn = await lawyerAssignment.findAll({
      where: {
        lawyer_id: req.user.id
      }
    });
    var cases = [];
    for(var l=0;l<law_aagn.length;l++)
    {
      cases.push(law_aagn[l].case_id)
    }
    msgCondition.id = cases
  }
  msgCondition.status= {
    [Op.ne]: 0
  }
  // console.log(msgCondition);
  var find_case = await AllCase.findAll({
    where: msgCondition,
    order: [['createdAt', 'DESC']]
  });
  var msg_case_id = [];
  for (var i = 0; i < find_case.length; i++) {
    msg_case_id.push(find_case[i].id);
  }
  var new_msg = await Conversation.findAll({
    where: {
      case_id : msg_case_id,
      status: 0,
      user_id: {
        [Op.ne]: req.user.id
      }
    }
  })
  res.json({
    success: true,
    new_msg : new_msg.length,
  })
})

router.get("/change-password", auth, csrfProtection, (req, res) => {
  var err_password_message = req.flash("change-pass")[0];
  res.render("change_password", {
    layout: "dashboard",
    title: "Change Password",
    csrfToken: req.csrfToken(),
    err_password_message
  });

});

router.post("/change-password", auth, csrfProtection, (req, res) => {
  User.findAll({
    where: {
      id: req.user.id
    },
    raw: true
  }).then(result => {
    var compare = bCrypt.compareSync(req.body.password, result[0].password);
    if (compare) {
      User.update(
        {
          password: bCrypt.hashSync(req.body.new_password)
        },
        {
          where: {
            id: req.user.id
          }
        }
      ).then(change => {
        req.flash(
          "success-password-message",
          "Password updated successfully, Please login again."
        );
        res.redirect("/logout");
      });
    } else {
      req.flash(
        "change-pass",
        "Current password not matched, Please enter the correct password"
      );
      res.redirect("/change-password");
    }
  });
});

router.get("/forgot-password", async (req, res) => {
  var err_password_mcaptcha = req.flash("forgotPassMsg")[0];
  res.render("forgot_password", {
    layout: "frontend",
    title: "Forgot Password",
    err_password_mcaptcha
  })
});

router.get("/site-profile", auth, async (req, res) => {
  var update_profile_message = req.flash("update-site-admin")[0];

  if (req.user.role_id == "2") {
    User.hasMany(Lawyers, {
      foreignKey: "lawyer_id"
    });
    User.hasMany(Education, {
      foreignKey: "lawyer_id"
    });
    User.hasMany(CourtToLawyer, {
      foreignKey: "lawyer_id"
    });
    User.hasMany(PracticeAreaToLawyer, {
      foreignKey: "lawyer_id"
    });
    User.hasMany(LawyerBankDetail, {
      foreignKey: "lawyer_id"
    });
    User.hasMany(LawyerRatingsDetail, {
      foreignKey: "lawyer_id"
    });
    var lawyer = await User.findOne({
      where: {
        id: req.user.id
      },
      include: [
        {
          model: Lawyers
        },
        {
          model: Education
        },
        {
          model: CourtToLawyer
        },
        {
          model: PracticeAreaToLawyer
        },
        {
          model: LawyerBankDetail
        },
        {
          model: LawyerRatingsDetail
        }
      ]
    });
    var state = await State.findById(lawyer.lawyers[0].state);
    var city = await City.findById(lawyer.lawyers[0].city);
    var jurisdiction = await Jurisdiction.findById(
      lawyer.lawyers[0].jurisdiction_id
    );
    var court_id = [];
    for (var c = 0; c < lawyer.court_to_lawyers.length; c++) {
      court_id.push(lawyer.court_to_lawyers[c].court_id);
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
        lawyer_practice_area_id: lawyer.practice_area_to_lawyers[p].id,
        practice_area: p_area.name,
        sub_practice_area: sub_p_area.name
      });
    }
  } else if (req.user.role_id == "3") {
    var customerDetails = await Customer.findOne({
      where: {
        user_id: req.user.id
      }
    });

    if (customerDetails) {
      var cityName = await City.findOne({
        where: {
          id: customerDetails.city_id
        }
      });

      var stateName = await State.findOne({
        where: {
          id: customerDetails.state_id
        }
      });

      var ContactPersonDetails = await ContactPerson.findAll({
        where: {
          custome_id: customerDetails.id
        }
      });
    }

    var firmDetails = await Firm.findOne({
      where: {
        id: req.user.firm_id
      }
    });
  } else if (req.user.role_id == "5") {
    var mang_state = await State.findOne({
      where: {
        id: req.user.state_id
      }
    });
    var mang_city = await City.findOne({
      where: {
        id: req.user.city_id
      }
    });
  }

  res.render("profile", {
    layout: "dashboard",
    title: "View Profile",
    update_profile_message,
    lawyer: lawyer ? lawyer : "",
    state: state ? state : "",
    city: city ? city : "",
    jurisdiction: jurisdiction ? jurisdiction : "",
    court: court ? court : "",
    lawyerPracticeArea: lawyerPracticeArea ? lawyerPracticeArea : "",
    firmDetails: firmDetails ? firmDetails : "",
    customerDetails,
    ContactPersonDetails,
    cityName: cityName ? cityName : "",
    stateName: stateName ? stateName : "",
    mang_state: mang_state ? mang_state.name : "",
    mang_city: mang_city ? mang_city.name : ""
  });
});

router.get("/edit-site-profile", auth, csrfProtection, async (req, res) => {
  if (req.user.role_id == "3") {
    var firmDetails = await Firm.findOne({
      where: {
        id: req.user.firm_id
      }
    });

    var customerDetails = await Customer.findOne({
      where: {
        user_id: req.user.id
      }
    });

    if (customerDetails) {
      var cityName = await City.findAll({
        where: {
          state_id: customerDetails.state_id
        }
      });

      var ContactPersonDetails = await ContactPerson.findAll({
        where: {
          custome_id: customerDetails.id
        }
      });
    }
  }
  var city = await City.findAll();
  var state = await State.findAll();
  var fetch_city = await City.findAll({
    where: {
      state_id: req.user.state_id
    }
  });
  res.render("edit_profile", {
    layout: "dashboard",
    title: "Edit Profile",
    csrfToken: req.csrfToken(),
    firmDetails: firmDetails ? firmDetails : "",
    city,
    state,
    cityName: cityName ? cityName : "",
    fetch_city: fetch_city ? fetch_city : "",
    ContactPersonDetails: ContactPersonDetails ? ContactPersonDetails : "",
    customerDetails: customerDetails ? customerDetails : ""
  });
});

router.post(
  "/edit-site-profile",
  auth,
  profile1.single("firm_logo"),
  csrfProtection,
  async (req, res) => {
    const avatar = gravatar.url(req.body.email, {
      s: "150",
      r: "pg",
      d: "mm"
    });
    await User.update(
      {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        mobile: removePhoneMask(req.body.mobile),
        state_id: req.body.state,
        city_id: req.body.city
      },
      {
        where: {
          id: req.user.id
        }
      }
    );

    if (req.user.role_id == "3" && req.user.sub_role == "C") {
      var idDetails;
      var c_Name = req.body.c_name;
      var c_Email = req.body.c_email;
      var C_Phone = req.body.c_phone;
      var customers = await Customer.findOne({
        where: {
          user_id: req.user.id
        }
      });
       await User.update({
        notification_email : req.body.notification_email ? req.body.notification_email : 0
       },{
        where: {
          id: req.user.id
        }
      });

      if (customers) {
        await Customer.update(
          {
            name: `${req.body.first_name} ${req.body.last_name}`,
            logo:
              req.file === undefined
                ? req.body.hiddenImage
                : `/logo/${req.file.filename}`,
            gst: req.body.gst,
            state_id: req.body.state,
            city_id: req.body.city,
            status: 0
          },
          {
            where: {
              user_id: req.user.id
            }
          }
        );

        await ContactPerson.destroy({
          where: {
            custome_id: customers.id
          }
        });

        await Firm.update(
          {
            image:
              req.file === undefined
                ? req.body.hiddenImage
                : `/logo/${req.file.filename}`
          },
          {
            where: { id: req.user.firm_id }
          }
        );

        idDetails = customers.id;
      } else {
        var customerDetails = await Customer.create({
          name: `${req.body.first_name} ${req.body.last_name}`,
          firm_id: req.user.firm_id,
          logo: req.file === undefined ? avatar : `/logo/${req.file.filename}`,
          gst: req.body.gst,
          state_id: req.body.state,
          city_id: req.body.city,
          user_id: req.user.id,
          status: 0
        });

        idDetails = customerDetails.id;

        await Firm.update(
          {
            image:
              req.file === undefined ? avatar : `/logo/${req.file.filename}`
          },
          {
            where: { id: req.user.firm_id }
          }
        );
      }

      for (let i = 0; i < c_Name.length; i++) {
        if (c_Name[i] !== "") {
          await ContactPerson.create({
            name: c_Name[i],
            email: c_Email[i],
            phone: C_Phone[i],
            custome_id: idDetails,
            status: "0"
          });
        }
      }
    }

    req.flash("update-site-admin", " Profile Updated Successfully");
    res.redirect("/site-profile");
  }
);

router.post(
  "/change-profile-picture",
  auth,
  profile.single("avatar"),
  async (req, res) => {
    const avatar = gravatar.url(req.body.email, {
      s: "150",
      r: "pg",
      d: "mm"
    });
    await User.update(
      {
        avatar:
          req.file === undefined
            ? req.user.avatar
            : `/site_profile/${req.file.filename}`
      },
      {
        where: {
          id: req.user.id
        }
      }
    );

    //req.flash("update-site-admin", " Profile Updated Successfully");
    res.redirect("/edit-site-profile");
  }
);

router.get("/remove-admin-site-photo", auth, async (req, res) => {
  const avatar = gravatar.url(req.user.email, {
    s: "150",
    r: "pg",
    d: "mm"
  });
  await User.update(
    {
      avatar
    },
    {
      where: {
        id: req.user.id
      }
    }
  );
  res.json({
    success: true
  });
});

router.get("/stamp-paper", auth, csrfProtection, (req, res) => {
  var stamp_paper_req_msg = req.flash("stamp_paper_req_msg")[0];
  res.render("stamp_paper", {
    layout: "dashboard",
    title: "Add Stamp Paper",
    csrfToken: req.csrfToken(),
    stamp_paper_req_msg
  });
});

router.get("/notification-legalcart", auth, async (req, res) => {
  const notificationDetails = await Notifications.findAll({
    where: {
      receive_id: req.user.id,
      status: 1
    },
    order: [["id", "DESC"]]
  });

  res.json({
    success: true,
    data: notificationDetails
  });
});

router.post("/notification-update", auth, async (req, res) => {

  await Notifications.update({
    status: 2
  }, {
      where: {
        id: req.body.noti_id,
      }
    });

  res.json({
    success: true,
  });

});

/* Stamp paper request in Admin section By TAMASHREE */
router.post("/stamp-paper-request", auth, (req, res) => {
  StampPaper.create({
    user_id: req.user.id,
    stamp_paper_state: req.body.stamp_paper_state,
    first_party: req.body.first_party,
    second_party: req.body.second_party,
    purchaser: req.body.purchaser,
    stampduty_paid_by: req.body.stampduty_paid_by,
    stamp_paper_value: req.body.stamp_paper_value,
    no_of_stamp_paper: req.body.no_of_stamp_paper,
    document_description: req.body.document_description,
    property_description: req.body.property_description,
    shipping_customer_full_name: req.body.shipping_customer_full_name,
    shipping_telephone_no: req.body.shipping_telephone_no,
    shipping_email_id: req.body.shipping_email_id,
    shipping_state: req.body.shipping_state,
    shipping_address: req.body.shipping_address,
    shipping_city: req.body.shipping_city,
    shipping_pincode: req.body.shipping_pincode,
    status: "0",
    payment_id: req.body.payment_id
  }).then(result => {
    req.flash(
      "stamp_paper_req_msg",
      "Your request to create stamp paper sent successfully"
    );
    res.redirect("/stamp-paper");
  });
});

/* Get all stamp papers of a particular user in Admin section By TAMASHREE */
router.get("/stamp-paper-all-list", auth, csrfProtection, async (req, res) => {
  var getAllList = await StampPaper.findAll({
    where: {
      user_id: req.user.id
    },
    order: [["id", "DESC"]]
  });
  //console.log(JSON.stringify(getAllList, undefined, 2));
  res.render("stamp_paper_listing", {
    layout: "dashboard",
    title: "Stamp Paper List",
    csrfToken: req.csrfToken(),
    getAllList
  });
});

router.get("/get-pie-chart-case", auth, async (req, res) => {
  var case_state = await AllCase.findAll({
    attributes: ["state_id"]
  });
  var stateCase = [];
  for (let i = 0; i < case_state.length; i++) {
    stateCase.push(case_state[i].state_id);
  }
  let x = stateCase => stateCase.filter((v, i) => stateCase.indexOf(v) === i);
  var state_case = x(stateCase);
  State.hasMany(AllCase, {
    foreignKey: "state_id"
  });
  var case_to_state = await State.findAll({
    where: {
      id: state_case
    },
    include: [
      {
        model: AllCase
      }
    ]
  });
  var pie_case_chart = [];
  for (let j = 0; j < case_to_state.length; j++) {
    pie_case_chart.push({
      backgroundColor: getRandomColor(),
      text: case_to_state[j].name,
      values: [case_to_state[j].all_cases.length]
    });
  }
  res.json({
    pie_case_chart: pie_case_chart
  });
});

router.get("/get-pie-chart-case-stage", auth, async (req, res) => {
  var whereCondition = {};
  var whereConditionCase = {};

  if (req.user.role_id == "2") {
    whereCondition.user_id = req.user.id
  }

  else if (req.user.role_id == "3") {
    if (req.user.sub_role == "C") {
      whereCondition.firm_id = req.user.firm_id
    }
  }

  else if (req.user.role_id == "5") {
    whereCondition.customer_id = req.user.id
  }

  var case_stages = await AllCaseStatus.findAll({
    where: whereCondition,
    attributes: ["case_status_category_id"]
  });

  var case_stage = [];
  for (let i = 0; i < case_stages.length; i++) {
    case_stage.push(case_stages[i].case_status_category_id);
  }
  
  let x = case_stage => case_stage.filter((v, i) => case_stage.indexOf(v) === i);
  var stage_case = x(case_stage);
  CaseStatusCategory.hasMany(AllCaseStatus, {
    foreignKey: "case_status_category_id"
  });
  var case_to_stage = await CaseStatusCategory.findAll({
    where: {
      id: stage_case
    },
    include: [
      {
        model: AllCaseStatus,
        where: whereCondition
      }
    ]
  });

  var pie_case_chart = [];
  for (let j = 0; j < case_to_stage.length; j++) {
    pie_case_chart.push({
      backgroundColor: getRandomColor(),
      text: case_to_stage[j].name,
      values: [case_to_stage[j].all_case_statuses.length]
    });
  }

  res.json({
    pie_case_stage_chart: pie_case_chart
  });
});

router.get("/get-pie-corporate-chart-case", auth, async (req, res) => {
  var case_state = await AllCase.findAll({
    where: {
      firm_id: req.user.firm_id
    },
    attributes: ["state_id"]
  });
  var stateCase = [];
  for (let i = 0; i < case_state.length; i++) {
    stateCase.push(case_state[i].state_id);
  }
  let x = stateCase => stateCase.filter((v, i) => stateCase.indexOf(v) === i);
  var state_case = x(stateCase);
  State.hasMany(AllCase, {
    foreignKey: "state_id"
  });
  var case_to_state = await State.findAll({
    where: {
      id: state_case
    },
    include: [
      {
        model: AllCase
      }
    ]
  });
  var pie_case_chart = [];
  for (let j = 0; j < case_to_state.length; j++) {
    pie_case_chart.push({
      backgroundColor: getRandomColor(),
      text: case_to_state[j].name,
      values: [case_to_state[j].all_cases.length]
    });
  }
  res.json({
    pie_case_chart: pie_case_chart
  });
});

router.get("/get-bar-chart-case", auth, async (req, res) => {
  var case_state = await AllCase.findAll({
    attributes: ["state_id"]
  });
  var stateCase = [];
  for (let i = 0; i < case_state.length; i++) {
    stateCase.push(case_state[i].state_id);
  }
  let x = stateCase => stateCase.filter((v, i) => stateCase.indexOf(v) === i);
  var state_case = x(stateCase);
  var case_to_state = await State.findAll({
    where: {
      id: state_case
    }
  });
  var bar_new_case_chart = [];
  var bar_pending_case_chart = [];
  var bar_closed_case_chart = [];
  var state = [];
  for (let j = 0; j < case_to_state.length; j++) {
    var all_new_case = await AllCase.findAll({
      where: {
        state_id: case_to_state[j].id,
        status: 0
      }
    });
    var all_pending_case = await AllCase.findAll({
      where: {
        state_id: case_to_state[j].id,
        status: 3
      }
    });
    var all_closed_case = await AllCase.findAll({
      where: {
        state_id: case_to_state[j].id,
        closeing_status: 1
      }
    });
    state.push(case_to_state[j].name);
    bar_new_case_chart.push(all_new_case.length);
    bar_pending_case_chart.push(all_pending_case.length);
    bar_closed_case_chart.push(all_closed_case.length);
  }
  //console.log(bar_new_case_chart)
  res.json({
    bar_new_case_chart: bar_new_case_chart,
    bar_pending_case_chart: bar_pending_case_chart,
    bar_closed_case_chart: bar_closed_case_chart,
    state: state
  });
});

router.get("/get-corporate-bar-chart-case", auth, async (req, res) => {
  var whereCondition = {};
  if (req.user.role_id == "5") {
    whereCondition.customer_id = req.user.id
  }
  else {
    whereCondition.firm_id = req.user.firm_id
  }
  var case_state = await AllCase.findAll({
    where: whereCondition,
    attributes: ["state_id"]
  });
  var stateCase = [];
  for (let i = 0; i < case_state.length; i++) {
    stateCase.push(case_state[i].state_id);
  }
  let x = stateCase => stateCase.filter((v, i) => stateCase.indexOf(v) === i);
  var state_case = x(stateCase);
  var case_to_state = await State.findAll({
    where: {
      id: state_case
    }
  });
  var bar_new_case_chart = [];
  var bar_pending_case_chart = [];
  var bar_closed_case_chart = [];
  var state = [];
  for (let j = 0; j < case_to_state.length; j++) {
    var all_new_case = await AllCase.findAll({
      where: {
        state_id: case_to_state[j].id,
        status: 0
      }
    });
    var all_pending_case = await AllCase.findAll({
      where: {
        state_id: case_to_state[j].id,
        status: 3
      }
    });
    var all_closed_case = await AllCase.findAll({
      where: {
        state_id: case_to_state[j].id,
        closeing_status: 1
      }
    });
    state.push(case_to_state[j].name);
    bar_new_case_chart.push(all_new_case.length);
    bar_pending_case_chart.push(all_pending_case.length);
    bar_closed_case_chart.push(all_closed_case.length);
  }
  res.json({
    bar_new_case_chart: bar_new_case_chart,
    bar_pending_case_chart: bar_pending_case_chart,
    bar_closed_case_chart: bar_closed_case_chart,
    state: state
  });
});

router.get(
  "/get-corporate-bar-chart-case-by-period",
  auth,
  async (req, res) => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];
    var all_case = await AllCase.findAll({
      where: {
        firm_id: req.user.firm_id
      }
    });
    var jan = [];
    var feb = [];
    var mar = [];
    var apr = [];
    var may = [];
    var jun = [];
    var jul = [];
    var aug = [];
    var sep = [];
    var oct = [];
    var nov = [];
    var dec = [];
    for (let i = 0; i < all_case.length; i++) {
      if (
        monthNames[new Date(all_case[i].createdAt).getMonth()] == "January" &&
        new Date(all_case[i].createdAt).getFullYear() ==
        new Date().getFullYear()
      ) {
        jan.push(all_case[i]);
      }
      if (
        monthNames[new Date(all_case[i].createdAt).getMonth()] == "February" &&
        new Date(all_case[i].createdAt).getFullYear() ==
        new Date().getFullYear()
      ) {
        feb.push(all_case[i]);
      }
      if (
        monthNames[new Date(all_case[i].createdAt).getMonth()] == "March" &&
        new Date(all_case[i].createdAt).getFullYear() ==
        new Date().getFullYear()
      ) {
        mar.push(all_case[i]);
      }
      if (
        monthNames[new Date(all_case[i].createdAt).getMonth()] == "April" &&
        new Date(all_case[i].createdAt).getFullYear() ==
        new Date().getFullYear()
      ) {
        apr.push(all_case[i]);
      }
      if (
        monthNames[new Date(all_case[i].createdAt).getMonth()] == "May" &&
        new Date(all_case[i].createdAt).getFullYear() ==
        new Date().getFullYear()
      ) {
        may.push(all_case[i]);
      }
      if (
        monthNames[new Date(all_case[i].createdAt).getMonth()] == "June" &&
        new Date(all_case[i].createdAt).getFullYear() ==
        new Date().getFullYear()
      ) {
        jun.push(all_case[i]);
      }
      if (
        monthNames[new Date(all_case[i].createdAt).getMonth()] == "July" &&
        new Date(all_case[i].createdAt).getFullYear() ==
        new Date().getFullYear()
      ) {
        jul.push(all_case[i]);
      }
      if (
        monthNames[new Date(all_case[i].createdAt).getMonth()] == "August" &&
        new Date(all_case[i].createdAt).getFullYear() ==
        new Date().getFullYear()
      ) {
        aug.push(all_case[i]);
      }
      if (
        monthNames[new Date(all_case[i].createdAt).getMonth()] == "September" &&
        new Date(all_case[i].createdAt).getFullYear() ==
        new Date().getFullYear()
      ) {
        sep.push(all_case[i]);
      }
      if (
        monthNames[new Date(all_case[i].createdAt).getMonth()] == "October" &&
        new Date(all_case[i].createdAt).getFullYear() ==
        new Date().getFullYear()
      ) {
        oct.push(all_case[i]);
      }
      if (
        monthNames[new Date(all_case[i].createdAt).getMonth()] == "November" &&
        new Date(all_case[i].createdAt).getFullYear() ==
        new Date().getFullYear()
      ) {
        nov.push(all_case[i]);
      }
      if (
        monthNames[new Date(all_case[i].createdAt).getMonth()] == "December" &&
        new Date(all_case[i].createdAt).getFullYear() ==
        new Date().getFullYear()
      ) {
        dec.push(all_case[i]);
      }
    }
    var tot_case = [
      jan.length,
      feb.length,
      mar.length,
      apr.length,
      may.length,
      jun.length,
      jul.length,
      aug.length,
      sep.length,
      oct.length,
      nov.length,
      dec.length
    ];
    res.json({
      tot_case: tot_case
    });
  }
);

//For Dashboard Message Show
router.post("/dashboard-massage-details-show", auth, async (req, res) => {
  casefetchId = {}

  //casefetchId.case_type_id = 7;
  // casefetchId.createdAt = { [Op.gte]: moment().subtract(3, 'days').toDate() }
  if(req.body.firm_id == "0")
  {
    if (req.user.role_id == 3) {
      casefetchId.firm_id = req.user.firm_id
    } else if (req.user.role_id == 5) {
      casefetchId.customer_id = req.user.id
    }
    else if (req.user.role_id == 2)
    {
      var lawyerCaseId = [];
      var lwayerassign = await lawyerAssignment.findAll({
        where: {
          lawyer_id: req.user.id,
          invitation_status: 0
        }
      })
      for(var l=0; l< lwayerassign.length;l++)
      {
        lawyerCaseId.push(lwayerassign[l].case_id)
      }
      casefetchId.id = lawyerCaseId;
    }
  }
  else
  {
    casefetchId.firm_id = req.body.firm_id
  }
  const caseDetails = await AllCase.findAll({
    where: [
      Sequelize.literal(`date("createdAt") >date_trunc('day', NOW() - interval '1 month') and date("createdAt")<= date(NOW())`),
      casefetchId
    ],
  });
  res.json({
    success: true,
    info: caseDetails
  });

});

router.get("/caselist-by-month/:id/:firm_id", auth, async(req, res) => {

  casefetchId = {}
  casefetchId.case_type_id = 7;
  if(req.params['firm_id'] == "0")
  {
    if (req.user.role_id == 3) {
      casefetchId.firm_id = req.user.firm_id
    } else if (req.user.role_id == 5) {
      casefetchId.customer_id = req.user.id
    }
  }
  else
  {
    casefetchId.firm_id = req.params['firm_id']
  }

  //case fatch
  AllCase.hasMany(CabCaseDetail, {
    foreignKey: 'case_id'
  });
  

  const case_details = await AllCase.findAll({
      where: [casefetchId,
      Sequelize.literal(`date("all_case"."createdAt") >date_trunc('day', NOW() - interval '1 month') and date("all_case"."createdAt")<= date(NOW())`)],
      order: [
          ['id', 'DESC']
      ],
      include: [{
          model: CabCaseDetail
      }],
  });

    var current_case = [];

    case_details.forEach((data, index) => {

        var todayTime = new Date(data.createdAt);
        var day = todayTime.getDate()

            if (req.params['id']=='1-7' && (day === 1 ||day === 2 ||day === 3 ||day === 4 ||day === 5 ||day === 6 ||day === 7) ) {
              current_case.push(data);
            } else if (req.params['id']=='8-15' && (day === 8 || day === 9 ||day === 10 ||day === 11 ||day === 12 ||day === 13 ||day === 14 ||day === 15)) {
             current_case.push(data);
            } else if (req.params['id']=='16-23' && (day === 16 || day === 17 ||day === 18 ||day === 19 ||day === 20 ||day === 21 ||day === 22 ||day === 23)) {
             current_case.push(data);
            }  else if (req.params['id']=='24-31' && (day === 24 || day === 25 ||day === 26 ||day === 27 ||day === 28 ||day === 29 ||day === 30 ||day === 31)) {
             current_case.push(data);
            }
            
    });
    if(req.params['firm_id'] != "0")
    {
      var firm_name = await Firm.findOne({
        where: {
          id: req.params['firm_id']
        }
      })
    }
  res.render('case/caselist_by_month/case_list_by_month',{
    layout: "dashboard",
    title: "Case list",
    caseDetails: current_case,
    firm_name: firm_name ? `of ${firm_name.name}` : "" 
  })

});




router.get("/get-pie-chart-city-lawyers", auth, async (req, res) => {
  var user = await User.findAll({
    where: {
      role_id: 2,
      status: 1,
      login_first_status: 1
    },
    attributes: ["city_id"]
  });
  var cityCase = [];
  for (let i = 0; i < user.length; i++) {
    cityCase.push(user[i].city_id);
  }
  let x = cityCase => cityCase.filter((v, i) => cityCase.indexOf(v) === i);
  var city_case = x(cityCase);
  City.hasMany(User, {
    foreignKey: "city_id"
  });
  var case_to_city = await City.findAll({
    where: {
      id: city_case
    },
    include: [{
      model: User,
      where: {
        role_id: 2,
        status: 1,
        login_first_status: 1
      }
    }]
  });
  var pie_case_chart = [];
  for (let j = 0; j < case_to_city.length; j++) {
    pie_case_chart.push({
      backgroundColor: getRandomColor(),
      text: case_to_city[j].name,
      values: [case_to_city[j].users.length]
    });
  }
  res.json({
    pie_case_chart: pie_case_chart
  });
});

router.get("/messagge-list/:firm_id", auth, async (req, res) => {
  var whereCondition = {};
  if(req.params['firm_id'] == "0")
  {
    if(req.user.role_id == "3")
    {
      whereCondition.firm_id= req.user.firm_id
    }
    else if(req.user.role_id == "5")
    {
      whereCondition.customer_id= req.user.id
    }
    else if(req.user.role_id == "2")
    {
      var law_aagn = await lawyerAssignment.findAll({
        where: {
          lawyer_id: req.user.id
        }
      });
      var cases = [];
      for(var l=0;l<law_aagn.length;l++)
      {
        cases.push(law_aagn[l].case_id)
      }
      whereCondition.id = cases
    }
  }
  else
  {
    whereCondition.firm_id = req.params['firm_id']
  }
  whereCondition.status= {
    [Op.ne]: 0
  }
  console.log(whereCondition);
  var find_case = await AllCase.findAll({
    where: whereCondition,
    order: [['updatedAt', 'DESC']]
  });
  var msg = [];
  for (var i = 0; i < find_case.length; i++) {
    var msg_find = await Conversation.findAll({
      limit: "1",
      where: {
        case_id: find_case[i].id
      },
      order: [['createdAt', 'DESC']]
    });
    if(msg_find.length != 0)
    {
      var todayTime = new Date(msg_find[0].createdAt);
      month = '' + (todayTime.getMonth() + 1),
        day = '' + todayTime.getDate(),
        year = todayTime.getFullYear();
  
      if (month.length < 2) month = '0' + month;
      if (day.length < 2) day = '0' + day;
  
      var creation_date = [ day,month, year].join('/');
  
      var d = new Date(msg_find[0].createdAt),
        dformat = [d.getDate(),
        d.getMonth() + 1,
        d.getFullYear()].join('/') + ' ' +
          [d.getHours(),
          d.getMinutes(),
          d.getSeconds()].join(':');
  
      var header = "n";
  
      var startDate = new Date(msg_find[0].createdAt);
  
      var endDate = new Date();
      var diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
      var diff = (endDate.getTime() - startDate.getTime()) / 1000;
      var hour = diff / (60 * 60);
      var minute = diff / 60;
      var hrs = Math.abs(Math.round(hour));
      var mins = Math.abs(Math.round(minute));
      var sec = Math.abs(Math.round(diff));
      var get_time = "";
      if (sec < 60) {
        get_time = "Just now";
      }
      else if (sec >= 60 && mins < 60 && diffDays == 1) {
        get_time = mins + " mins ago";
      }
      else if (sec > 60 && mins >= 60 && diffDays == 1) {
        get_time = hrs + " hours ago";
      }
      else if (sec > 60 && mins > 60 && diffDays > 1 && diffDays < 7) {
        get_time = diffDays - 1 + " days ago"
      }
      else if (sec > 60 && mins > 60 && diffDays >= 7) {
        get_time = dformat;
      }
      msg.push({
        "case_id": find_case[i].id,
        "case_no": find_case[i].cab_no == 0 ? find_case[i].case_no : find_case[i].cab_no,
        "msg": msg_find[0].c_msg,
        "status": msg_find[0].status,
        "user_id": msg_find[0].user_id,
        "time": get_time
      });
    }

  }
  if(req.params['firm_id'] != "0")
  {
    var firm_name = await Firm.findOne({
      where: {
        id: req.params['firm_id']
      }
    })
  }
  res.render("message_list",{
    layout: "dashboard",
    title: "Message Lists",
    msg,
    firm_name: firm_name ? `of ${firm_name.name}` : ""
  })
});

router.post("/get-cases-by-month-site-admin",async(req, res)=> {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();
    var current_month = mm;
    const current_month_name = today.toLocaleString('en-us', {
      month: 'long'
    });
    var pre_date = new Date(today.setMonth(today.getMonth() - 1))
    var pre_mm = today.getMonth() + 1;
     const pre_month_name = pre_date.toLocaleString('en-us', {
       month: 'long'
     });
     var whereCondition = {};
     if(req.body.firm_id == "0")
     {
       if(req.user.role_id == "3")
       {
         if(req.user.sub_role == "C")
         {
           whereCondition.firm_id = req.user.firm_id;
         }
       }
     }
     else{
      whereCondition.firm_id = req.body.firm_id;
     }
    var case_city = await AllCase.findAll({
      where: whereCondition,
      attributes: ["city_id"]
    });
    var cityCase = [];
    for (let i = 0; i < case_city.length; i++) {
      cityCase.push(case_city[i].city_id);
    }
    let x = cityCase => cityCase.filter((v, i) => cityCase.indexOf(v) === i);
    var city_case = x(cityCase);
    var case_to_city = await City.findAll({
      where: {
        id: city_case
      }
    });
    var city_case_month = [];
    for (let j = 0; j < case_to_city.length; j++) {
      var whereConditionCity = {};
      if(req.body.firm_id == "0")
      {
        if (req.user.role_id == "3") {
          if (req.user.sub_role == "C") {
            whereConditionCity.firm_id = req.user.firm_id;
          }
        }
      }
      else{
        whereConditionCity.firm_id = req.body.firm_id;
       }
      whereConditionCity.city_id = case_to_city[j].id
      var all_case = await AllCase.findAll({
        where: whereConditionCity
      });
      var newCase = [];
      var pendingCase = [];
      var closeCase = [];
      var assignCase = [];
      var allCase = [];
      for (var a = 0; a < all_case.length;a++)
      {
        var dateCase = new Date(all_case[a].createdAt);
        var caseMonth = dateCase.getMonth() + 1;
        if (caseMonth == current_month)
        {
          allCase.push(all_case[a]);
          if (all_case[a].closeing_status == "1") {
            closeCase.push(all_case[a])
          }
          else
          {
            if(all_case[a].status == "1")
            {
              assignCase.push(all_case[a])
            }
            else
            {
              pendingCase.push(all_case[a])
            }
          } 
        }
      }
      if (allCase.length != "0")
      {
        city_case_month.push({
          "city_name": case_to_city[j].name,
          "closeCase": `Closed Cases: ${closeCase.length}`,
          "newCase": `Total Cases: ${allCase.length}`,
          "pendingCase":  req.user.role_id == "1" ? `Pending Cases: ${pendingCase.length}` : `Pending Cases: ${pendingCase.length + assignCase.length}` ,
          "completeLawyer": req.user.role_id == "1" ? `Completed By Lawyer: ${assignCase.length}` : ''
        })
      }
    }
    if(req.body.firm_id != "0")
    {
      var firm_name = await Firm.findOne({
        where: {
          id: req.body.firm_id
        }
      })
    }
    res.json({
      success: true,
      city_case_month: city_case_month,
      current_month:current_month,
      current_month_name:current_month_name,
      pre_mm:pre_mm,
      pre_month_name:pre_month_name,
      firm_name: firm_name ? firm_name : ""
    })
});

router.post("/get-cases-by-month-site-admin-filter",auth, async(req, res)=> {
  var dates = new Date();
  var dd = dates.getDate();
  var mm = req.body.month_id;
  var yyyy = dates.getFullYear();

  if (dd < 10) {
    dd = '0' + dd;
  }

  if (mm < 10) {
    mm = '0' + mm;
  }

  dates = yyyy + '/' + mm + '/' + dd;
  var today = new Date(dates);
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!
  var yyyy = today.getFullYear();
  var current_month = mm;
  const current_month_name = today.toLocaleString('en-us', {
    month: 'long'
  });
  var pre_date = new Date(today.setMonth(today.getMonth() - 1))
  var pre_mm = today.getMonth() + 1;
  const pre_month_name = pre_date.toLocaleString('en-us', {
    month: 'long'
  });
  var next_date = new Date(today.setMonth(today.getMonth() + 2))
  var next_mm = today.getMonth() + 1;

  const next_month_name = next_date.toLocaleString('en-us', {
    month: 'long'
  });
  var whereCondition = {};
  if(req.body.firm_id == "0")
  {
    if(req.user.role_id == "3")
    {
      if(req.user.sub_role == "C")
      {
        whereCondition.firm_id = req.user.firm_id;
      }
    }
  }
  else
  {
    whereCondition.firm_id = req.body.firm_id;
  }
  var case_city = await AllCase.findAll({
    where: whereCondition,
    attributes: ["city_id"]
  });
  var cityCase = [];
  for (let i = 0; i < case_city.length; i++) {
    cityCase.push(case_city[i].city_id);
  }
  let x = cityCase => cityCase.filter((v, i) => cityCase.indexOf(v) === i);
  var city_case = x(cityCase);
  var case_to_city = await City.findAll({
    where: {
      id: city_case
    }
  });
  var city_case_month = [];
  for (let j = 0; j < case_to_city.length; j++) {
    var whereConditionCity = {};
    if(req.body.firm_id == "0")
    {
      if (req.user.role_id == "3") {
        if (req.user.sub_role == "C") {
          whereConditionCity.firm_id = req.user.firm_id;
        }
      }
    }
    else
    {
      whereConditionCity.firm_id = req.body.firm_id;
    }
      whereConditionCity.city_id = case_to_city[j].id
    var all_case = await AllCase.findAll({
      where: whereConditionCity
    });
    var newCase = [];
    var pendingCase = [];
    var closeCase = [];
    var assignCase = [];
    var allCase = [];
    for (var a = 0; a < all_case.length; a++) {
      var dateCase = new Date(all_case[a].createdAt);
      var caseMonth = dateCase.getMonth() + 1;
      if (caseMonth == req.body.month_id) {
        allCase.push(all_case[a]);
        if (all_case[a].closeing_status == "1") {
          closeCase.push(all_case[a])
        } else
          {
            if(all_case[a].status == "1")
            {
              assignCase.push(all_case[a])
            }
            else
            {
              pendingCase.push(all_case[a])
            }
          } 
      }
    }
    if (allCase.length != "0") {
      city_case_month.push({
          "city_name": case_to_city[j].name,
          "closeCase": `Closed Cases: ${closeCase.length}`,
          "newCase": `Total Cases: ${allCase.length}`,
          "pendingCase":  req.user.role_id == "1" ? `Pending Cases: ${pendingCase.length}` : `Pending Cases: ${pendingCase.length + assignCase.length}` ,
          "completeLawyer": req.user.role_id == "1" ? `Completed By Lawyer: ${assignCase.length}` : ''
        })
    }
  }
  if(req.body.firm_id != "0")
  {
    var firm_name = await Firm.findOne({
      where: {
        id: req.body.firm_id
      }
    })
  }
  res.json({
    success: true,
    city_case_month: city_case_month,
    current_month: current_month,
    current_month_name: current_month_name,
    pre_mm: pre_mm,
    pre_month_name: pre_month_name,
    next_mm: next_mm,
    next_month_name:next_month_name,
    firm_name: firm_name ? firm_name : ""
  })
});


router.post("/get-cases-by-week-site-admin", auth, async(req, res)=> {
   var currentDate = moment();

   var weekStart = currentDate.clone().startOf('isoWeek');
   var weekEnd = currentDate.clone().endOf('isoWeek');

   var days = [];

   for (var i = 0; i <= 6; i++) {
     days.push(moment(weekStart).add(i, 'days').format("DD/MM/YYYY"));
   }
   var beforeWeekStart = currentDate.clone().subtract(1, 'weeks').startOf('isoWeek');
   var beforeWeekEnd = currentDate.clone().subtract(1, 'weeks').endOf('isoWeek');
   var current_week = `${moment(weekStart).format("DD MMMM")} - ${moment(weekEnd).format("DD MMMM")}`;
   var prev_week = `${moment(beforeWeekStart).format("DD MMMM")} - ${moment(beforeWeekEnd).format("DD MMMM")}`;
   var prev_week_date = moment(beforeWeekStart).format("YYYY/MM/DD");
   var current_week_date = moment(weekStart).format("YYYY/MM/DD");
   var whereCondition = {};
    if(req.body.firm_id == "0")
    {
      if(req.user.role_id == "3")
      {
        if(req.user.sub_role == "C")
        {
          whereCondition.firm_id = req.user.firm_id;
        }
      }
    }
    else
    {
      whereCondition.firm_id = req.body.firm_id;
    }
  var case_city = await AllCase.findAll({
    where: whereCondition,
    attributes: ["city_id"]
  });
  var cityCase = [];
  for (let i = 0; i < case_city.length; i++) {
    cityCase.push(case_city[i].city_id);
  }
  let x = cityCase => cityCase.filter((v, i) => cityCase.indexOf(v) === i);
  var city_case = x(cityCase);
  var case_to_city = await City.findAll({
    where: {
      id: city_case
    }
  });
  var city_case_month = [];
  for (let j = 0; j < case_to_city.length; j++) {
    var whereConditionCity = {};
    if(req.body.firm_id == "0")
    {
      if (req.user.role_id == "3") {
        if (req.user.sub_role == "C") {
          whereConditionCity.firm_id = req.user.firm_id;
        }
      }
    }
    else
    {
      whereConditionCity.firm_id = req.body.firm_id;
    }
      whereConditionCity.city_id = case_to_city[j].id;
      whereConditionCity.create_case_date = days;
    var all_case = await AllCase.findAll({
      where: whereConditionCity
    });
    var newCase = [];
    var pendingCase = [];
    var closeCase = [];
    var assignCase = [];
    var allCase = [];
    for (var a = 0; a < all_case.length; a++) {
      allCase.push(all_case[a]);
      if (all_case[a].closeing_status == "1") {
        closeCase.push(all_case[a])
      } else
          {
            if(all_case[a].status == "1")
            {
              assignCase.push(all_case[a])
            }
            else
            {
              pendingCase.push(all_case[a])
            }
          } 
    }
    if (allCase.length != "0") {
      city_case_month.push({
          "city_name": case_to_city[j].name,
          "closeCase": `Closed Cases: ${closeCase.length}`,
          "newCase": `Total Cases: ${allCase.length}`,
          "pendingCase":  req.user.role_id == "1" ? `Pending Cases: ${pendingCase.length}` : `Pending Cases: ${pendingCase.length + assignCase.length}` ,
          "completeLawyer": req.user.role_id == "1" ? `Completed By Lawyer: ${assignCase.length}` : ''
        })
    }
  }
  if(req.body.firm_id != "0")
  {
    var firm_name = await Firm.findOne({
      where: {
        id: req.body.firm_id
      }
    })
  }
  res.json({
    success: true,
    city_case_month: city_case_month,
    current_week:current_week,
    prev_week:prev_week,
    prev_week_date:prev_week_date,
    current_week_date: current_week_date,
    firm_name: firm_name ? firm_name : ""
  })
});

router.post("/get-cases-by-week-site-admin-filter", auth, async (req, res) => {
  var week_date = new Date(req.body.week_id);
   var currentDate = moment(week_date);

   var weekStart = currentDate.clone().startOf('isoWeek');
   var weekEnd = currentDate.clone().endOf('isoWeek');

   var days = [];

   for (var i = 0; i <= 6; i++) {
     days.push(moment(weekStart).add(i, 'days').format("DD/MM/YYYY"));
   };
   var beforeWeekStart = currentDate.clone().subtract(1, 'weeks').startOf('isoWeek');
   var beforeWeekEnd = currentDate.clone().subtract(1, 'weeks').endOf('isoWeek');
   var nextWeekStart = currentDate.clone().add(1, 'weeks').startOf('isoWeek');
   var nextWeekEnd = currentDate.clone().add(1, 'weeks').endOf('isoWeek');
   var current_week = `${moment(weekStart).format("DD MMMM")} - ${moment(weekEnd).format("DD MMMM")}`;
   var prev_week = `${moment(beforeWeekStart).format("DD MMMM")} - ${moment(beforeWeekEnd).format("DD MMMM")}`;
   var next_week = `${moment(nextWeekStart).format("DD MMMM")} - ${moment(nextWeekEnd).format("DD MMMM")}`;
   var prev_week_date = moment(beforeWeekStart).format("YYYY/MM/DD");
   var next_week_date = moment(nextWeekStart).format("YYYY/MM/DD");
   var current_week_date = moment(weekStart).format("YYYY/MM/DD");
   var whereCondition = {};
    if(req.body.firm_id == "0")
    {
      if(req.user.role_id == "3")
      {
        if(req.user.sub_role == "C")
        {
          whereCondition.firm_id = req.user.firm_id;
        }
      }
    }
    else
    {
      whereCondition.firm_id = req.body.firm_id;
    }
  var case_city = await AllCase.findAll({
    where: whereCondition,
    attributes: ["city_id"]
  });
  var cityCase = [];
  for (let i = 0; i < case_city.length; i++) {
    cityCase.push(case_city[i].city_id);
  }
  let x = cityCase => cityCase.filter((v, i) => cityCase.indexOf(v) === i);
  var city_case = x(cityCase);
  var case_to_city = await City.findAll({
    where: {
      id: city_case
    }
  });
  var city_case_month = [];
  for (let j = 0; j < case_to_city.length; j++) {
    var whereConditionCity = {};
    if(req.body.firm_id == "0")
    {
      if (req.user.role_id == "3") {
        if (req.user.sub_role == "C") {
          whereConditionCity.firm_id = req.user.firm_id;
        }
      }
    }
    else
    {
      whereConditionCity.firm_id = req.body.firm_id;
    }
      whereConditionCity.city_id = case_to_city[j].id
      whereConditionCity.create_case_date = days
    var all_case = await AllCase.findAll({
      where: whereConditionCity
    });
    var newCase = [];
    var pendingCase = [];
    var closeCase = [];
    var assignCase = [];
    var allCase = [];
    for (var a = 0; a < all_case.length; a++) {
      allCase.push(all_case[a]);
      if (all_case[a].closeing_status == "1") {
        closeCase.push(all_case[a])
      } else
          {
           if(all_case[a].status == "1")
            {
              assignCase.push(all_case[a])
            }
            else
            {
              pendingCase.push(all_case[a])
            }
          } 
    }
    if (allCase.length != "0") {
      city_case_month.push({
          "city_name": case_to_city[j].name,
          "closeCase": `Closed Cases: ${closeCase.length}`,
          "newCase": `Total Cases: ${allCase.length}`,
          "pendingCase":  req.user.role_id == "1" ? `Pending Cases: ${pendingCase.length}` : `Pending Cases: ${pendingCase.length + assignCase.length}` ,
          "completeLawyer": req.user.role_id == "1" ? `Completed By Lawyer: ${assignCase.length}` : ''
        })
    }
  }
  if(req.body.firm_id != "0")
  {
    var firm_name = await Firm.findOne({
      where: {
        id: req.body.firm_id
      }
    })
  }  
  res.json({
    success: true,
    city_case_month: city_case_month,
    current_week:current_week,
    prev_week:prev_week,
    prev_week_date:prev_week_date,
    next_week:next_week,
    next_week_date:next_week_date,
    current_week_date: current_week_date,
    firm_name: firm_name ? firm_name : ""
  })
});

router.get("/all-case/:city_id/:firm_id/:month_id", auth, async(req, res)=> {
  var dates = new Date();
  var dd = dates.getDate();
  var mm = req.params['month_id'];
  var yyyy = dates.getFullYear();

  if (dd < 10) {
    dd = '0' + dd;
  }

  if (mm < 10) {
    mm = '0' + mm;
  }

  dates = yyyy + '/' + mm + '/' + dd;
  var today = new Date(dates);
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!
  var yyyy = today.getFullYear();
  const month_name = today.toLocaleString('en-us', {
    month: 'long'
  });
  var city_id = await City.findOne({
    where: {
      name: req.params['city_id']
    }
  });
  AllCase.belongsTo(User, {
    foreignKey: 'customer_id'
  });
  AllCase.belongsTo(RateList, {
    foreignKey: 'case_type_id'
  });
  var whereConditionCity = {};
  if(req.params['firm_id'] == "0")
  {
    if (req.user.role_id == "3") {
      if (req.user.sub_role == "C") {
        whereConditionCity.firm_id = req.user.firm_id;
      }
    }
  }
  else
  {
    whereConditionCity.firm_id = req.params['firm_id'];
  }
  whereConditionCity.city_id = city_id.id
  var all_case = await AllCase.findAll({
    where: whereConditionCity,
    include: [{
      model:User
    },{
      model: RateList
    }]
  });
  var allCase = [];
  for (var a = 0; a < all_case.length; a++) {
    var dateCase = new Date(all_case[a].createdAt);
    var caseMonth = dateCase.getMonth() + 1;
    if (caseMonth == req.params['month_id']) {
      allCase.push(all_case[a]);
    }
  }
  if(req.params['firm_id'] != "0")
  {
    var firm_name = await Firm.findOne({
      where: {
        id: req.params['firm_id']
      }
    })
  }
  res.render("case/find_case_by_city_month",{
    layout: "dashboard",
    title: "Case by City",
    allCase,
    city: req.params['city_id'],
    month_name,
    firm_name: firm_name ? `of ${firm_name.name}` : ""    
  })
});

router.get("/all-case-week/:city_id/:firm_id/:year/:month/:date", auth, async(req, res)=> {
  var week_date = new Date(`${req.params['year']}/${req.params['month']}/${req.params['date']}`);
  var currentDate = moment(week_date);

  var weekStart = currentDate.clone().startOf('isoWeek');
  var weekEnd = currentDate.clone().endOf('isoWeek');

  var days = [];

  for (var i = 0; i <= 6; i++) {
    days.push(moment(weekStart).add(i, 'days').format("DD/MM/YYYY"));
  };
  var current_week = `${moment(weekStart).format("DD MMMM")} - ${moment(weekEnd).format("DD MMMM")}`;
  var city_id = await City.findOne({
    where: {
      name: req.params['city_id']
    }
  });
  AllCase.belongsTo(User, {
    foreignKey: 'customer_id'
  });
  AllCase.belongsTo(RateList, {
    foreignKey: 'case_type_id'
  });
  var whereConditionCity = {};
  if(req.params['firm_id'] == "0")
  {
    if (req.user.role_id == "3") {
      if (req.user.sub_role == "C") {
        whereConditionCity.firm_id = req.user.firm_id;
      }
    }
  }
  else
  {
    whereConditionCity.firm_id = req.params['firm_id'];
  }
  whereConditionCity.city_id = city_id.id,
  whereConditionCity.create_case_date = days
  var allCase = await AllCase.findAll({
    where: whereConditionCity,
    include: [{
      model:User
    },{
      model: RateList
    }]
  });
  if(req.params['firm_id'] != "0")
  {
    var firm_name = await Firm.findOne({
      where: {
        id: req.params['firm_id']
      }
    })
  }
  res.render("case/find_case_by_city_month",{
    layout: "dashboard",
    title: "Case by City",
    allCase,
    city: req.params['city_id'],
    month_name: current_week,
    firm_name: firm_name ? `of ${firm_name.name}` : ""       
  })
});

router.post("/show-matrix-chart-by-firm-site-admin", auth, async(req, res) => {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!
  var yyyy = today.getFullYear();
  var current_month = mm;
  const current_month_name = today.toLocaleString('en-us', {
    month: 'long'
  });
  var pre_date = new Date(today.setMonth(today.getMonth() - 1))
  var pre_mm = today.getMonth() + 1;
  const pre_month_name = pre_date.toLocaleString('en-us', {
    month: 'long'
  });
  var case_city = await AllCase.findAll({
    where: {
      firm_id: req.body.firm_id
    },
    attributes: ["city_id"]
  });
  var cityCase = [];
  for (let i = 0; i < case_city.length; i++) {
    cityCase.push(case_city[i].city_id);
  }
  let x = cityCase => cityCase.filter((v, i) => cityCase.indexOf(v) === i);
  var city_case = x(cityCase);
  var case_to_city = await City.findAll({
    where: {
      id: city_case
    }
  });
  var city_case_month = [];
  for (let j = 0; j < case_to_city.length; j++) {
    var whereConditionCity = {};
    whereConditionCity.firm_id = req.body.firm_id;
    whereConditionCity.city_id = case_to_city[j].id
    var all_case = await AllCase.findAll({
      where: whereConditionCity
    });
    var newCase = [];
    var pendingCase = [];
    var closeCase = [];
    var assignCase = [];
    var allCase = [];
    for (var a = 0; a < all_case.length; a++) {
      var dateCase = new Date(all_case[a].createdAt);
      var caseMonth = dateCase.getMonth() + 1;
      if (caseMonth == current_month) {
        allCase.push(all_case[a]);
        if (all_case[a].closeing_status == "1") {
          closeCase.push(all_case[a])
        } else {
          if (all_case[a].status == "1") {
            assignCase.push(all_case[a])
          } else {
            pendingCase.push(all_case[a])
          }
        }
      }
    }
    if (allCase.length != "0") {
      city_case_month.push({
        "city_name": case_to_city[j].name,
        "closeCase": `Closed Cases: ${closeCase.length}`,
        "newCase": `Total Cases: ${allCase.length}`,
        "pendingCase":  req.user.role_id == "1" ? `Pending Cases: ${pendingCase.length}` : `Pending Cases: ${pendingCase.length + assignCase.length}` ,
          "completeLawyer": req.user.role_id == "1" ? `Completed By Lawyer: ${assignCase.length}` : ''
      })
    }
  }

  var firm_name = await Firm.findOne({
    where: {
      id: req.body.firm_id
    }
  })

  var find_case = await AllCase.findAll({
    where: {
      firm_id: req.body.firm_id
    },
    order: [['createdAt', 'DESC']]
  });
  var msg_case_id = [];
  for (var l = 0; l < find_case.length; l++) {
    msg_case_id.push(find_case[l].id);
  }
  var new_msg = await Conversation.findAll({
    where: {
      case_id : msg_case_id,
      status: 0,
      user_id: {
        [Op.ne]: req.user.id
      }
    }
  })

  res.json({
    success: true,
    city_case_month: city_case_month,
    current_month: current_month,
    current_month_name: current_month_name,
    pre_mm: pre_mm,
    pre_month_name: pre_month_name,
    firm_name: firm_name,
    new_msg : new_msg.length != 0 ? `${new_msg.length} new messages` : '',
  });
});

router.get("/Get-city-manager-list", auth, async(req, res) => {
  var city_manager_list = await User.findAll({
    where: {
      firm_id: req.user.firm_id,
      role_id: 5
    }
  });
  res.json({
    success: true,
    city_manager_list: city_manager_list
  })
});

router.post(
  "/Get-city-manager-list-login-corporate-admin",
  passport.authenticate("local-login-corporate-user-login", {
    failureRedirect: "/",
    failureFlash: true
  }),
  async (req, res) => {
    await User.update({
      actual_user_id: req.body.actual_user_id
    },{
      where: {
        id: req.user.id
      }
    })
    console.log(req.body.actual_user_id);
    res.redirect("/dashboard");
  }
);

router.post(
  "/Get-back-to-login-corporate-admin",
  passport.authenticate("local-login-corporate-user-login", {
    failureRedirect: "/",
    failureFlash: true
  }),
  async (req, res) => {
    await User.update({
      actual_user_id: 0
    },{
      where: {
        firm_id: req.user.firm_id
      }
    })
    res.redirect("/dashboard");
  }
);

router.get("/search-by-header", auth, async(req,res) => {
  const state = await State.findAll({
      order: [
          ['name', 'ASC'],
      ],
  });
  const Rate_list = await RateList.findAll({
      order: [
          ['type_of_case', 'ASC'],
      ],
  });
  Lawyers.belongsTo(User, {
    foreignKey: 'lawyer_id'
  });
  const lawyer_name = await Lawyers.findAll({
    where: {
      panel_member: 1,
    },
    include:[{
      model: User
    }],
      order: [
          [User,'first_name', 'ASC'],
      ],
  });
  AllCase.hasMany(lawyerAssignment, {
    foreignKey: 'case_id'
  });
  AllCase.belongsTo(State, {
    foreignKey: 'state_id'
  });
  AllCase.belongsTo(City, {
    foreignKey: 'city_id'
  });
  AllCase.belongsTo(RateList, {
    foreignKey: 'case_type_id'
  });
  lawyerAssignment.belongsTo(User, {
      foreignKey: 'lawyer_id'
  });
  var whereCondition = {};
  if (req.user.role_id == 3) {
    whereCondition.firm_id = req.user.firm_id
  } else if (req.user.role_id == 5) {
    whereCondition.customer_id = req.user.id
  }
  else if (req.user.role_id == 2)
  {
    var lawyerCaseId = [];
    var lwayerassign = await lawyerAssignment.findAll({
      where: {
        lawyer_id: req.user.id
      }
    })
    for(var l=0; l< lwayerassign.length;l++)
    {
      lawyerCaseId.push(lwayerassign[l].case_id)
    }
    whereCondition.id = lawyerCaseId;
  }
  if(req.query.state)
  {
    whereCondition.state_id = req.query.state
    var city_list = await City.findAll({
      where: {
        state_id: req.query.state
      }
    });
  }
  if(req.query.city)
  {
    whereCondition.city_id = req.query.city
  }
  if(req.query.lawyer_name)
  {
    var law_assngn = await lawyerAssignment.findAll({
      where: {
        lawyer_id: req.query.lawyer_name,
        invitation_status: 0
      }
    });
    var case_law_id = [];
    for(var l=0; l< law_assngn.length; l++)
    {
      case_law_id.push(law_assngn[l].case_id);
    }
    whereCondition.id = case_law_id
  }
  if(req.query.category)
  {
    whereCondition.case_type_id = req.query.category
  }
  if(req.query.status)
  {
    if(req.query.status == "N"){
      whereCondition.status = 0;
    }
    else if(req.query.status == "P"){
      whereCondition.status = 3;
    }
    else if(req.query.status == "L"){
      whereCondition.status = 1;
      whereCondition.closeing_status = 0;
    }
    else if(req.query.status == "C"){
      whereCondition.status = 1;
      whereCondition.closeing_status = 1;
    }
  }
  whereCondition.cab_no= {
    ilike: `%${req.query.search_name}%`
  }
  var search_list = await AllCase.findAll({
    where: whereCondition,
    include: [{
        model: lawyerAssignment,
        include: [{
            model:User
        }]
    },{
      model:State
    },{
      model:City
    },{
      model:RateList
    }]
  });
  res.render("case/search_list",{
    layout: "dashboard",
    title: "Search",
    search_list,
    state,
    lawyer_name,
    Rate_list,
    search_name: req.query.search_name,
    state_search: req.query.state ? req.query.state : '',
    city_list: req.query.state ? city_list : '',
    city_search: req.query.city ? req.query.city : '',
    lawyer_name_search: req.query.lawyer_name ? req.query.lawyer_name : '',
    category_search: req.query.category ? req.query.category : '',
    status_search: req.query.status ? req.query.status : ''
  })
});

module.exports = router;
