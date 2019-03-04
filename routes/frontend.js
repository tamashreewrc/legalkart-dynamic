const express = require("express");
const csrf = require("csurf");
const PacticeArea = require("../models").pacticearea;
const SubPacticeArea = require("../models").sub_pacticearea;
const User = require("../models").user;
const Lawyers = require("../models").lawyer;
const PracticeAreaToLawyer = require("../models").practice_area_to_lawyer;
const City = require("../models").city;
const State = require("../models").state;
const Education = require("../models").education;
const CourtToLawyer = require("../models").court_to_lawyer;
const LawyerBankDetail = require("../models").lawyer_bank_detail;
const LawyerRatingsDetail = require("../models").lawyer_rating_review;
const headerMenu = require("../middlewares/frontend_header");
const court = require("../models").court;
const Court = require("../models").court;
const Jurisdiction = require("../models").jurisdiction;
const StampPaper = require("../models").stamp_paper;
const FreeAdvice = require("../models").free_advice;
const Notifications = require("../models").notification;
const LegalService = require("../models").legal_service_category;
const SubLegalService = require("../models").legal_service_sub_category;
const LegalServiceContent = require("../models").legal_service_content;
const OrderLegalService = require("../models").order_legal_service;
const Faq = require("../models").faq;
const Rate = require("../models").rate;
const LawyerContact = require("../models").lawyer_contact;
const Resource = require("../models").resource;
const RateList = require("../models").rate_list;
const AllCase = require("../models").all_case;
const gravatar = require("gravatar");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const city = require("../models").city;
const auth = require("../middlewares/auth");

var csrfProtection = csrf({
  cookie: true
});

const bCrypt = require("bcrypt-nodejs");

const router = express.Router();

// router.get("/", headerMenu, async (req, res) => {
//   const get_city = await city.findAll({
//     where: {
//       name: [
//         "Bangalore",
//         "Chandigarh",
//         "Chennai",
//         "Delhi",
//         "Gurgaon",
//         "Hyderabad",
//         "Jaipur",
//         "Mumbai",
//         "Pune"
//       ]
//     }
//   });
//   const get_pacticearea = await SubPacticeArea.findAll({
//     where: {
//       name: [
//         "Cheque Bounce",
//         "Civil",
//         "Consumer Court",
//         "Corporate",
//         "Criminal",
//         "Cyber Crime",
//         "Divorce",
//         "Family Dispute",
//         "Property"
//       ]
//     }
//   });
//   const get_court = await court.findAll({
//     where: {
//       name: [
//         "Allahabad High Court",
//         "Bombay High Court",
//         "Calcutta High Court",
//         "Delhi High Court",
//         "Hyderabad High Court",
//         "Madras High Court",
//         "Haryana High Court",
//         "Rajasthan High Court",
//         "Supreme Court Of India"
//       ]
//     }
//   });
//   const faq = await Faq.findAll({
//     limit: "7"
//   });
//   LegalServiceContent.belongsTo(SubLegalService, {
//     foreignKey: "legal_service_sub_id"
//   });
//   const legal_service_show = await LegalServiceContent.findAll({
//     where: {
//       legal_service_sub_id: [14, 34, 56, 69]
//     },
//     include: [
//       {
//         model: SubLegalService
//       }
//     ]
//   });
//   res.render("frontend/home", {
//     layout: "frontend",
//     title: "Home",
//     get_city,
//     get_pacticearea,
//     get_court,
//     faq,
//     legal_service_show
//   });
// });

function calcDate(date1, date2) {
  var diff = Math.floor(date1.getTime() - date2.getTime());
  var day = 1000 * 60 * 60 * 24;

  var days = Math.floor(diff / day);
  var months = Math.floor(days / 31);
  var years = Math.floor(months / 12);

  var message = years;

  return message;
}

router.get("/lawyers-directory/:id", headerMenu, async (req, res) => {
  PracticeAreaToLawyer.belongsTo(SubPacticeArea, {
    foreignKey: "sub_practice_area_id"
  });
  const sub_practice_area = await SubPacticeArea.findOne({
    where: {
      id: req.params["id"]
    }
  });
  var lawyers_list = [];
  const lawyerPracticeArea = await PracticeAreaToLawyer.findAll({
    where: {
      sub_practice_area_id: req.params["id"]
    }
  });
  for (var i = 0; i < lawyerPracticeArea.length; i++) {
    var lawyer_info = await User.findOne({
      where: {
        id: lawyerPracticeArea[i].lawyer_id
      }
    });
    var lawyer_detail = await Lawyers.findOne({
      where: {
        lawyer_id: lawyerPracticeArea[i].lawyer_id
      }
    });
    var practice_start = lawyer_detail.practice_start;
    var date = new Date();
    var experience = calcDate(date, practice_start);
    var state = await State.findOne({
      where: {
        id: lawyer_detail.state
      }
    });
    var city = await City.findOne({
      where: {
        id: lawyer_detail.city
      }
    });
    const lawyer_practice = await PracticeAreaToLawyer.findAll({
      where: {
        lawyer_id: lawyerPracticeArea[i].lawyer_id
      },
      include: [
        {
          model: SubPacticeArea
        }
      ]
    });
    var lawyer_practice_area = [];
    for (var s = 0; s < lawyer_practice.length; s++) {
      lawyer_practice_area.push(lawyer_practice[s].sub_pacticearea.name);
    }
    var lawyer_practice_area_length = lawyer_practice_area.length;
    var over_length =
      lawyer_practice_area_length > "4"
        ? parseInt(lawyer_practice_area_length) - parseInt(4)
        : "";
    var review = await LawyerRatingsDetail.findAll({
      where: {
        lawyer_id: lawyerPracticeArea[i].lawyer_id
      }
    });
    var ratings = [];
    for (var r = 0; r < review.length; r++) {
      ratings.push(parseFloat(review[r].ratings));
    }
    var sum_ratings = ratings.reduce((a, b) => a + b, 0);
    var avg_rating =
      review.length != 0
        ? (sum_ratings / parseInt(review.length)).toFixed(1)
        : 0;
    var star_set =
      Math.floor(avg_rating) +
      (Math.round(avg_rating - Math.floor(avg_rating)) ? 0.5 : 0.0);
    lawyers_list.push({
      lawyer: lawyer_info,
      lawyer_details: lawyer_detail,
      lawyer_practice: lawyer_practice_area.splice(0, 4),
      experience: experience,
      state: state.name,
      city: city.name,
      over_length: over_length,
      avg_rating: avg_rating,
      tot_user_ratings: review.length > "100" ? "100 +" : review.length,
      star_set: star_set
    });
  }
  res.render("frontend/lawyer_directory", {
    layout: "frontend",
    title: "Top Lawyers",
    sub_practice_area,
    lawyers_list
  });
});

router.get("/view-profile/:id", headerMenu, async (req, res) => {
  var case_type = await RateList.findAll({
    order: [["type_of_case", "ASC"]]
  });
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
  const lawyer = await User.findOne({
    where: {
      id: req.params["id"]
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
  const state = await State.findById(lawyer.lawyers[0].state);
  const city = await City.findById(lawyer.lawyers[0].city);
  const jurisdiction = await Jurisdiction.findById(
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
    var sub_p_area = await SubPacticeArea.findOne({
      where: {
        id: lawyer.practice_area_to_lawyers[p].sub_practice_area_id
      }
    });
    lawyerPracticeArea.push({
      sub_practice_area: sub_p_area.name
    });
  }
  var practice_start = lawyer.lawyers[0].practice_start;
  var date = new Date();
  var experience = calcDate(date, practice_start);
  var review = lawyer.lawyer_rating_reviews;
  var ratings = [];
  for (var r = 0; r < review.length; r++) {
    ratings.push(parseFloat(review[r].ratings));
  }
  var sum_ratings = ratings.reduce((a, b) => a + b, 0);
  var avg_rating =
    review.length != 0 ? (sum_ratings / parseInt(review.length)).toFixed(1) : 0;
  var star_set =
    Math.floor(avg_rating) +
    (Math.round(avg_rating - Math.floor(avg_rating)) ? 0.5 : 0.0);

  const rate = await Rate.findOne({
    where: {
      status: lawyer.sub_role
    },
    order: [["id", "DESC"]]
  });
  res.render("frontend/view_profile", {
    layout: "frontend",
    title: "View Profile",
    lawyer,
    state,
    city,
    jurisdiction,
    court,
    lawyerPracticeArea,
    experience,
    avg_rating,
    tot_user_ratings: review.length > "100" ? "100 +" : review.length,
    star_set,
    rate,
    case_type
  });
});

router.get("/legal-service-details/:id", headerMenu, async (req, res) => {
  const legal_service_category = await SubLegalService.findOne({
    where: {
      id: req.params["id"]
    }
  });
  const legal_service_other_category = await SubLegalService.findAll({
    where: {
      legal_service_category_id:
        legal_service_category.legal_service_category_id,
      status: 0,
      id: {
        [Op.ne]: req.params["id"]
      }
    }
  });
  const legal_service_Detail = await LegalServiceContent.findOne({
    where: {
      legal_service_sub_id: req.params["id"]
    }
  });
  res.render("frontend/legal_service_details", {
    layout: "frontend",
    title: "Legal Service Details",
    legal_service_category,
    legal_service_other_category,
    legal_service_Detail
  });
});

router.get("/about-us", headerMenu, async (req, res) => {
  const faq = await Faq.findAll({});
  res.render("frontend/about", {
    layout: "frontend",
    title: "About Us",
    faq
  });
});

router.get("/why-choose-us", headerMenu, async (req, res) => {
  res.render("frontend/why_choose_us", {
    layout: "frontend",
    title: "Why Choose Us"
  });
});

router.get("/resources", headerMenu, async (req, res) => {
  var resource = await Resource.findAll({
    where: {
      status: 1
    },
    limit: "5",
    order: [["id", "DESC"]]
  });
  var resource_latest = await Resource.findAll({
    where: {
      status: 1
    },
    limit: "4",
    order: [["id", "DESC"]]
  });
  res.render("frontend/resources", {
    layout: "frontend",
    title: "Resources",
    resource,
    resource_latest
  });
});

router.get("/resources/:name", headerMenu, async (req, res) => {
  var resource = await Resource.findAll({
    where: {
      resource_type: req.params["name"],
      status: 1
    },
    order: [["id", "DESC"]]
  });
  var resource_latest = await Resource.findAll({
    where: {
      resource_type: req.params["name"],
      status: 1
    },
    limit: "4",
    order: [["id", "DESC"]]
  });
  res.render("frontend/resources_types", {
    layout: "frontend",
    title: " Resources",
    resource,
    type: req.params["name"],
    resource_latest
  });
});

router.get("/blog-details/:id", headerMenu, async (req, res) => {
  var resource = await Resource.findOne({
    where: {
      id: req.params["id"]
    }
  });
  var resource_latest = await Resource.findAll({
    where: {
      resource_type: resource.resource_type,
      status: 1
    },
    limit: "4",
    order: [["id", "DESC"]]
  });
  res.render("frontend/blog_details", {
    layout: "frontend",
    title: "Resource details",
    resource,
    resource_latest
  });
});

router.get("/in-media", headerMenu, async (req, res) => {
  res.render("frontend/in_media", {
    layout: "frontend",
    title: "In Media"
  });
});

router.get("/terms-condition", headerMenu, async (req, res) => {
  res.render("frontend/terms_condition", {
    layout: "frontend",
    title: "Terms & Conditions for using LegalKart"
  });
});

router.get("/lawyer-signup", headerMenu, csrfProtection, async (req, res) => {
  var err_signup_lawyers = req.flash("signup-lawyer-dup-mail")[0];
  res.render("frontend/lawyer_signup", {
    layout: "frontend",
    title: "Lawyer Signup",
    err_signup_lawyers,
    csrfToken: req.csrfToken()
  });
});

router.get("/find-lawyers-by-city/:id", headerMenu, async (req, res) => {
  var city = await City.findOne({
    where: {
      id: req.params["id"]
    }
  });
  var find_lawyer = await Lawyers.findAll({
    where: {
      city: req.params["id"]
    }
  });
  PracticeAreaToLawyer.belongsTo(SubPacticeArea, {
    foreignKey: "sub_practice_area_id"
  });
  var lawyers_list = [];
  for (var i = 0; i < find_lawyer.length; i++) {
    var lawyer_info = await User.findOne({
      where: {
        id: find_lawyer[i].lawyer_id
      }
    });
    var lawyer_detail = await Lawyers.findOne({
      where: {
        lawyer_id: find_lawyer[i].lawyer_id
      }
    });
    var practice_start = lawyer_detail.practice_start;
    var date = new Date();
    var experience = calcDate(date, practice_start);
    var state = await State.findOne({
      where: {
        id: lawyer_detail.state
      }
    });
    var city = await City.findOne({
      where: {
        id: lawyer_detail.city
      }
    });
    const lawyer_practice = await PracticeAreaToLawyer.findAll({
      where: {
        lawyer_id: find_lawyer[i].lawyer_id
      },
      include: [
        {
          model: SubPacticeArea
        }
      ]
    });
    var lawyer_practice_area = [];
    for (var s = 0; s < lawyer_practice.length; s++) {
      lawyer_practice_area.push(lawyer_practice[s].sub_pacticearea.name);
    }
    var lawyer_practice_area_length = lawyer_practice_area.length;
    var over_length =
      lawyer_practice_area_length > "4"
        ? parseInt(lawyer_practice_area_length) - parseInt(4)
        : "";
    var review = await LawyerRatingsDetail.findAll({
      where: {
        lawyer_id: find_lawyer[i].lawyer_id
      }
    });
    var ratings = [];
    for (var r = 0; r < review.length; r++) {
      ratings.push(parseFloat(review[r].ratings));
    }
    var sum_ratings = ratings.reduce((a, b) => a + b, 0);
    var avg_rating =
      review.length != 0
        ? (sum_ratings / parseInt(review.length)).toFixed(1)
        : 0;
    var star_set =
      Math.floor(avg_rating) +
      (Math.round(avg_rating - Math.floor(avg_rating)) ? 0.5 : 0.0);
    lawyers_list.push({
      lawyer: lawyer_info,
      lawyer_details: lawyer_detail,
      lawyer_practice: lawyer_practice_area.splice(0, 4),
      experience: experience,
      state: state.name,
      city: city.name,
      over_length: over_length,
      avg_rating: avg_rating,
      tot_user_ratings: review.length > "100" ? "100 +" : review.length,
      star_set: star_set
    });
  }
  res.render("frontend/lawyer_list_by_city", {
    layout: "frontend",
    title: "lawyer list",
    city,
    lawyers_list
  });
});

router.get("/find-lawyers-by-court/:id", headerMenu, async (req, res) => {
  var court = await Court.findOne({
    where: {
      id: req.params["id"]
    }
  });
  var find_lawyer = await CourtToLawyer.findAll({
    where: {
      court_id: req.params["id"]
    }
  });
  PracticeAreaToLawyer.belongsTo(SubPacticeArea, {
    foreignKey: "sub_practice_area_id"
  });
  var lawyers_list = [];
  for (var i = 0; i < find_lawyer.length; i++) {
    var lawyer_info = await User.findOne({
      where: {
        id: find_lawyer[i].lawyer_id
      }
    });
    var lawyer_detail = await Lawyers.findOne({
      where: {
        lawyer_id: find_lawyer[i].lawyer_id
      }
    });
    var practice_start = lawyer_detail.practice_start;
    var date = new Date();
    var experience = calcDate(date, practice_start);
    var state = await State.findOne({
      where: {
        id: lawyer_detail.state
      }
    });
    var city = await City.findOne({
      where: {
        id: lawyer_detail.city
      }
    });
    const lawyer_practice = await PracticeAreaToLawyer.findAll({
      where: {
        lawyer_id: find_lawyer[i].lawyer_id
      },
      include: [
        {
          model: SubPacticeArea
        }
      ]
    });
    var lawyer_practice_area = [];
    for (var s = 0; s < lawyer_practice.length; s++) {
      lawyer_practice_area.push(lawyer_practice[s].sub_pacticearea.name);
    }
    var lawyer_practice_area_length = lawyer_practice_area.length;
    var over_length =
      lawyer_practice_area_length > "4"
        ? parseInt(lawyer_practice_area_length) - parseInt(4)
        : "";
    var review = await LawyerRatingsDetail.findAll({
      where: {
        lawyer_id: find_lawyer[i].lawyer_id
      }
    });
    var ratings = [];
    for (var r = 0; r < review.length; r++) {
      ratings.push(parseFloat(review[r].ratings));
    }
    var sum_ratings = ratings.reduce((a, b) => a + b, 0);
    var avg_rating =
      review.length != 0
        ? (sum_ratings / parseInt(review.length)).toFixed(1)
        : 0;
    var star_set =
      Math.floor(avg_rating) +
      (Math.round(avg_rating - Math.floor(avg_rating)) ? 0.5 : 0.0);
    lawyers_list.push({
      lawyer: lawyer_info,
      lawyer_details: lawyer_detail,
      lawyer_practice: lawyer_practice_area.splice(0, 4),
      experience: experience,
      state: state.name,
      city: city.name,
      over_length: over_length,
      avg_rating: avg_rating,
      tot_user_ratings: review.length > "100" ? "100 +" : review.length,
      star_set: star_set
    });
  }
  res.render("frontend/lawyer_list_by_court", {
    layout: "frontend",
    title: "lawyer list",
    court,
    lawyers_list
  });
});

//Frontend stamp paper page route by Tamashree
router.get("/stamppaper", headerMenu, csrfProtection, async (req, res) => {
  var stamppaper_req_msg_frnt = req.flash("stamppaper_req_msg_frnt")[0];
  res.render("frontend/stamppaper", {
    layout: "frontend",
    title: "Stamp Paper",
    csrfToken: req.csrfToken(),
    stamppaper_req_msg_frnt
  });
});

router.post(
  "/stamppaper-request-front",
  headerMenu,
  csrfProtection,
  async (req, res) => {
    var findAndCountEmail = await User.findAndCountAll({
      where: {
        email: req.body.shipping_email_id_frnt
      }
    });
    //console.log(JSON.stringify(findAndCountEmail, undefined, 2));
    if (findAndCountEmail.count > 0) {
      //if user already exists get the user id
      var userId = findAndCountEmail.rows[0].id;
    } else {
      //if user doesn't exist insert the user and get the user id
      var insertUser = await User.create({
        first_name: req.body.shipping_customer_full_name_frnt,
        email: req.body.shipping_email_id_frnt,
        notification_email: req.body.shipping_email_id_frnt,
        password: bCrypt.hashSync("12345678"),
        mobile: req.body.shipping_telephone_no_frnt,
        role_id: "3",
        sub_role: "R",
        state_id: req.body.stamp_paper_state_frnt,
        city_id: "0",
        firm_id: "0"
      });
      var userId = insertUser.id;
    }
    //console.log(userId);
    StampPaper.create({
      user_id: userId,
      stamp_paper_state: req.body.stamp_paper_state_frnt,
      first_party: req.body.first_party_frnt,
      second_party: req.body.second_party_frnt,
      purchaser: req.body.purchaser_frnt,
      stampduty_paid_by: req.body.stampduty_paid_by_frnt,
      stamp_paper_value: req.body.stamp_paper_value_frnt,
      no_of_stamp_paper: req.body.no_of_stamp_paper_frnt,
      document_description: req.body.document_description_frnt,
      property_description: req.body.property_description_frnt,
      shipping_customer_full_name: req.body.shipping_customer_full_name_frnt,
      shipping_telephone_no: req.body.shipping_telephone_no_frnt,
      shipping_email_id: req.body.shipping_email_id_frnt,
      shipping_state: req.body.shipping_state_frnt,
      shipping_address: req.body.shipping_address_frnt,
      shipping_city: req.body.shipping_city_frnt,
      shipping_pincode: req.body.shipping_pincode_frnt,
      status: "0",
      payment_id: req.body.payment_id
    });

    req.flash(
      "stamppaper_req_msg_frnt",
      "You request to create stamp paper sent successfully"
    );
    // res.redirect("/stamppaper");
    res.send({ payment_id: req.body.payment_id });
  }
);

// Legal Advice Categories Route
router.get("/legal-advice-categories", headerMenu, async (req, res) => {
  res.render("frontend/legal_advice_categories", {
    layout: "frontend",
    title: "Legal Advice Categories"
  });
});

// Legal Service Categories Route
router.get("/legal-service-categories", headerMenu, async (req, res) => {
  LegalService.hasMany(SubLegalService, {
    foreignKey: "legal_service_category_id"
  });
  const legal_service = await LegalService.findAll({
    include: [
      {
        model: SubLegalService
      }
    ],
    order: [[SubLegalService, "id", "ASC"]]
  });
  res.render("frontend/legal_service_categories", {
    layout: "frontend",
    title: "Legal Service Categories",
    legal_service
  });
});

router.post("/add/free-legal-consultation", async (req, res) => {
  await FreeAdvice.create({
    name: req.body.name,
    email: req.body.email,
    state: req.body.state,
    city: req.body.city,
    mobile: req.body.mobile,
    subject: req.body.subject,
    message: req.body.messages,
    status: 0
  });
  res.json({
    success: true
  });
});

router.post("/add/contact-lawyer", async (req, res) => {
  var contact_add = await LawyerContact.create({
    lawyer_id: req.body.lawyer_id,
    name: req.body.name,
    email: req.body.email,
    mobile: req.body.mobile,
    subject: req.body.subject,
    messages: req.body.messages,
    status: 0
  });
  const avatar = gravatar.url(req.body.email, {
    s: "150",
    r: "pg",
    d: "mm"
  });
  await Notifications.create({
    remarks: "Request a enquiry from " + req.body.name,
    receive_id: req.body.lawyer_id,
    status: 1,
    sender_id: contact_add.id,
    img: avatar,
    name: req.body.name,
    link: "/all-enquiry"
  });
  await Notifications.create({
    remarks: "Request a enquiry from " + req.body.name,
    receive_id: 1,
    status: 1,
    sender_id: contact_add.id,
    img: avatar,
    name: req.body.name,
    link: "/all-enquiry"
  });
  res.json({
    success: true
  });
});

router.post("/book-a-call-back", async (req, res) => {
  var contact_add = await LawyerContact.create({
    lawyer_id: 0,
    name: req.body.call_back_name,
    email: req.body.call_back_email,
    mobile: req.body.call_back_mobile,
    subject: "call",
    messages: req.body.call_back_messages,
    status: 0
  });
  const avatar = gravatar.url(req.body.call_back_email, {
    s: "150",
    r: "pg",
    d: "mm"
  });

  await Notifications.create({
    remarks: "Book a call from " + req.body.call_back_name,
    receive_id: 1,
    status: 1,
    sender_id: contact_add.id,
    img: avatar,
    name: req.body.call_back_name,
    link: "/all-enquiry"
  });
  res.json({
    success: true
  });
});

router.post("/order-legal-service", async (req, res) => {
  var order_legal_service = await OrderLegalService.create({
    legal_service_category_id: req.body.legal_service_category_id,
    name: req.body.name,
    email: req.body.email,
    mobile: req.body.mobile,
    messages: req.body.messages,
    status: 0
  });
  const avatar = gravatar.url(req.body.email, {
    s: "150",
    r: "pg",
    d: "mm"
  });
  await Notifications.create({
    remarks: "Buy a legal service from " + req.body.name,
    receive_id: 1,
    status: 1,
    sender_id: order_legal_service.id,
    img: avatar,
    name: req.body.name,
    link: "/all-enquiry"
  });
  res.json({
    success: true
  });
});

router.post("/book-lawyer", async (req, res) => {
  const avatar = gravatar.url(req.body.email, {
    s: "150",
    r: "pg",
    d: "mm"
  });
  var lawyer = await Lawyers.findOne({
    where: {
      lawyer_id: req.body.lawyer_id
    }
  });
  var indi_cust = await User.create({
    role_id: 3,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    notification_email: req.body.email,
    sub_role: "R",
    password: bCrypt.hashSync("12345678"),
    mobile: req.body.mobile,
    city_id: lawyer.city,
    state_id: lawyer.state,
    avatar
  });
  var case_add = await AllCase.create({
    case_no: "indi-case-" + indi_cust.id,
    cab_no: 0,
    customer_id: indi_cust.id,
    case_type: req.body.case_type,
    status: 0,
    closeing_status: 0,
    firm_id: 0,
    description: req.body.case_details,
    case_type_id: req.body.case_type,
    customer_type: "I",
    payment_status: 1,
    payment_amount: req.body.payment_amount,
    payment_id: req.body.payment_id
  });
  res.json({
    success: true
  });
});

module.exports = router;
