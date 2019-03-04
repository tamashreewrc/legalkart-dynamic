const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const exphbs = require("express-handlebars");
const passport = require("passport");
const path = require("path");
const flash = require("connect-flash");
const Cryptr = require('cryptr');
const cryptr = new Cryptr('myTotalySecretKey');

//const lodash = require('lodash');
const port = process.env.PORT || 3000;
var handlebars = require("handlebars"),
  layouts = require("handlebars-layouts");
handlebars.registerHelper(layouts(handlebars));

const app = express();
const index = require("./routes/index");
const jurisdiction = require("./routes/jurisdiction");
const lawyers = require("./routes/lawyers");
const freeLegalAdvices = require("./routes/free_legal_advices");
const employee = require("./routes/employee");
const customer = require("./routes/customer");
const court = require("./routes/court");
const legalCase = require("./routes/case");
const frontend = require("./routes/frontend");
const legalcartGst = require("./routes/gst");
const legal_service = require("./routes/legal_service");

//Practice Area
const parcticeArea = require("./routes/practiceArea");
const faq = require("./routes/faq");
const rate = require("./routes/rate");
const manager = require("./routes/manager");
const apilegalcart = require("./routes/api_legalkart");

// Admin view of stamp paper
const stamp_paper = require("./routes/stamp_paper");
const enquiry = require("./routes/enquiry");
const resource = require("./routes/resource");
const invoice = require("./routes/invoice");

//facebook integration
var Strategy = require("passport-facebook").Strategy;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

passport.use(
  new Strategy(
    {
      clientID: "956998654470464",
      clientSecret: "2c4bfa2d8acf4e02ea858d22eea71b2f",
      callbackURL: "http://localhost:5000/auth/facebook/callback",
      profileFields: ["id", "displayName", "emails"]
    },
    function(accessToken, refreshToken, profile, cb) {
      console.log(profile);
      // In this example, the user's Facebook profile is supplied as the user
      // record.  In a production-quality application, the Facebook profile should
      // be associated with a user record in the application's database, which
      // allows for account linking and authentication with other identity
      // providers.
      return cb(null, profile);
    }
  )
);

const allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // intercept OPTIONS method
  if ("OPTIONS" == req.method) {
    res.send(200);
  } else {
    next();
  }
};
app.use(allowCrossDomain);
require("./config/passport")(passport);

/////////////////////////////
const hbs = exphbs.create({
  extname: ".hbs",
  helpers: {
    check_image:(data,opts) => {
      if (data.split(".")[1]=='jpg' || data.split(".")[1]=='png' || data.split(".")[1]=='jpeg' ) {
        return opts.fn(this);
      } else {
        return opts.inverse(this);
      }
      
    },
    encriptUserid:(data,opts) =>{
      const encryptedString = cryptr.encrypt(data);
      // const decryptedString = cryptr.decrypt(encryptedString);
      // console.log(decryptedString);
      return encryptedString
      
    },
    eq: function(v1, v2) {
      return v1 == v2;
    },
    or: function(v1, v2, v3) {
      return v1 || v2;
    },
    or_get: function() {
      return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
    },
    if_eq: function(a, b, opts) {
      if (a == b) return opts.fn(this);
      else return opts.inverse(this);
    },
    inArray: function(array, value, block) {
      if (array.indexOf(value) !== -1) {
        return block.fn(this);
      } else {
        return block.inverse(this);
      }
    },
    math: function(lvalue, operator, rvalue) {
      lvalue = parseFloat(lvalue);
      rvalue = parseFloat(rvalue);
      return {
        "+": lvalue + rvalue,
        "-": lvalue - rvalue,
        "*": lvalue * rvalue,
        "/": lvalue / rvalue,
        "%": lvalue % rvalue
      }[operator];
    },
    first_letter: function(a) {
      return a.charAt(0);
    },
    show_button_add: function(index, opts) {
      if (index == 0) return opts.fn(this);
      else return opts.inverse(this);
    },
    striptags: function (txt) {
      // console.log(txt)
      // exit now if text is undefined 
      if (txt == null)
      {
        return;
      } 
      else
      {
        // the regular expresion
        var regexp = /<[\/\w]+>/g
        // replacing the text
        return txt.replace(regexp, '');
      }
    },
    compare_date: function (date, opts)
    {
      const oneDay = 60 * 60 * 24 * 1000
      const oneDayAgoDate = new Date(date.getTime() + oneDay);
      if(oneDayAgoDate > new Date())
      {
        return opts.fn(this);
      }
      else
      {
        return opts.inverse(this);
      }
    },
    check_length: function (array,value, opts)
    {
      var a = array.length;
      if (a == value) return opts.fn(this);
      else return opts.inverse(this);
    },
    splitString: function(value)
    {
      var a = value.split("/");
      return a.pop();
    },
    dateFormat: require("handlebars-dateformat")
  }
});

app.engine(".hbs", hbs.engine);
app.set("view engine", "hbs");

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());

app.use(
  session({
    secret: "W$q4=25*8%v-}UV",
    resave: false,
    saveUninitialized: true,
    cookie: {
      path: "/"
      //maxAge: 18000000000
    },
    name: "id",
    ttl: 1 * 60 * 60
  })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

/******** Routes *****/
app.use(index);
app.use(parcticeArea);

app.use(rate);

app.use(jurisdiction);
app.use(faq);
app.use(lawyers);
app.use(freeLegalAdvices);
app.use(employee);
app.use(customer);
app.use(court);
app.use(legalCase);
app.use(frontend);
app.use(stamp_paper);
app.use(manager);
app.use(legalcartGst);
app.use(legal_service);
app.use(enquiry);
app.use(resource);
app.use(invoice);
app.use(apilegalcart);

/********** End **********/

// Define routes.

app.get("/login/facebook", passport.authenticate("facebook"));

app.get(
  "/login/facebook/return",
  passport.authenticate("facebook", {
    failureRedirect: "/login"
  }),
  function(req, res) {
    res.redirect("/dashboard");
  }
);

app.use(function(req, res, next) {
  if (req.accepts("html")) {
    res.render("error", {
      url: req.url
    });
    return;
  }
});
app.listen(port, () => console.log(`Server listening to port ${port}`));
