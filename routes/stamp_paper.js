const express = require("express");
const csrf = require("csurf");
const auth = require("../middlewares/auth");
const CorporateCustomerAuth = require("../middlewares/corporate_cust_auth");
const StampPaper = require("../models").stamp_paper;
const State = require("../models").state;
const User = require("../models").user;
var fs = require("fs");

var csrfProtection = csrf({
  cookie: true
});

const router = express.Router();

router.get("/stamp-papers/list", auth, csrfProtection, async (req, res) => {
  const stamp_paper_list_pending = await StampPaper.findAll({
    where: {
      status: "0"
    },
    order: [
      ['id', 'DESC']
  ]
  });
  const stamp_paper_list_assigned = await StampPaper.findAll({
    where: {
      status: "1"
    },
    order: [
      ['id', 'DESC']
  ]
  });
  const stamp_paper_list_completed = await StampPaper.findAll({
    where: {
      status: "2"
    },
    order: [
      ['id', 'DESC']
  ]
  });
  res.render("stamp_paper/list", {
    layout: "dashboard",
    title: "Stamp Paper",
    csrfToken: req.csrfToken(),
    stamp_paper_list_pending,
    stamp_paper_list_assigned,
    stamp_paper_list_completed
  });
});

router.get(
  "/stamp-papers/list/:stamp_paper_id",
  auth,
  csrfProtection,
  async (req, res) => {
    var stamp_paper_id = req.params.stamp_paper_id;
    StampPaper.belongsTo(State, { foreignKey: "stamp_paper_state" });
    StampPaper.belongsTo(User, { foreignKey: "user_id" });
    var stamp_paper_detail = await StampPaper.findOne({
      where: { id: stamp_paper_id },
      include: [
        {
          model: State
        },
        {
          model: User
        }
      ]
    });
    //console.log(JSON.stringify(stamp_paper_detail, undefined, 2));
    res.render("stamp_paper/view", {
      layout: "dashboard",
      title: "Stamp Paper Detail",
      csrfToken: req.csrfToken(),
      stamp_paper_detail
    });
  }
);

router.post("/stamp-papers/vendor-assign", auth, async (req, res) => {
  console.log(req.body.vendorEmail);
  console.log(req.body.stampPaperId);
  var msg = "Stamp paper has been assigned to vendor successfully";
  await StampPaper.update(
    {
      status: "1"
    },
    {
      where: {
        id: req.body.stampPaperId
      }
    }
  );
  res.json({
    success: true,
    code: 200,
    msg
  });
});

module.exports = router;
