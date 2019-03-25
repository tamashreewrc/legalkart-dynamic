const express = require("express");
const csrf = require("csurf");
const auth = require("../middlewares/auth");
const Sequelize = require("sequelize");
const RateList = require("../models").rate_list;
const FormBuilder = require("../models").case_type_form;
const ConsumarCaseDetails = require("../models").consumer_cases_detail;
const Model = require("../models");
const Op = Sequelize.Op;
var fs = require("fs");
const { Pool, Client } = require("pg");

const router = express.Router();

var csrfProtection = csrf({
  cookie: true
});

const pool = new Pool({
  user: "postgres",
  host: "192.168.1.109",
  database: "legalkart_dynamic",
  password: "postgres",
  port: 5432
});

router.get("/dynamic-form-builder", auth, async (req, res) => {
  const case_type = await RateList.findAll();
  //console.log(JSON.stringify(case_type, undefined, 2));
  res.render("dynamic_form/index", {
    layout: "dashboard",
    title: "Form Builder",
    case_type
  });
});

router.post("/add/dynamic-form-builder-case", auth, async (req, res) => {
  var dup_check = await FormBuilder.findOne({
    where: {
      case_type_id: req.body.case_type
    }
  });
  if (dup_check != null) {
    res.json({
      status: 2
    });
  } else {
    //console.log(JSON.parse(req.body.formbuilder));exit();
    var formbuilder = JSON.parse(req.body.formbuilder);
    if (formbuilder.length == "0") {
      res.json({
        status: 3
      });
    } else {
      var model_create = [];
      for (var f = 0; f < formbuilder.length; f++) {
        var field_name =
          formbuilder[f].name != undefined
            ? formbuilder[f].name.toLowerCase()
            : "";
        field_name = field_name.replace(/\s+/g, "_");
        field_name = field_name.split("-").join("_");
        if (formbuilder[f].type == "text") {
          model_create.push(field_name + " VARCHAR(255)");
        }
        if (formbuilder[f].type == "textarea") {
          model_create.push(field_name + " TEXT");
        }
        if (formbuilder[f].type == "radio-group") {
          model_create.push(field_name + " VARCHAR(255)");
        }
        if (formbuilder[f].type == "number") {
          model_create.push(field_name + " VARCHAR(255)");
        }
        if (formbuilder[f].type == "file") {
          model_create.push(field_name + " VARCHAR(255)");
        }
        if (formbuilder[f].type == "date") {
          model_create.push(field_name + " TIMESTAMPTZ");
        }
        if (formbuilder[f].type == "checkbox-group") {
          model_create.push(field_name + " VARCHAR(255)");
        }
        if (formbuilder[f].type == "autocomplete") {
          model_create.push(field_name + " VARCHAR(255)");
        }
        if (formbuilder[f].type == "select") {
          if (field_name == "court") {
            model_create.push(field_name + " INTEGER");
          } else {
            model_create.push(field_name + " VARCHAR(255)");
          }
        }
        await FormBuilder.create({
          case_type_id: req.body.case_type,
          input_type: formbuilder[f].type,
          name: field_name ? field_name : "",
          placeholder: formbuilder[f].placeholder
            ? formbuilder[f].placeholder
            : "",
          label: formbuilder[f].label,
          required: formbuilder[f].required ? formbuilder[f].required : "",
          sub_type: formbuilder[f].subtype,
          status: 0
        });
      }
      var case_type = await RateList.findOne({
        where: {
          id: req.body.case_type
        }
      });
      var db_primary = case_type.type_of_case
        .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "")
        .toLowerCase();
      var case_db = db_primary.replace(/\s+/g, "_");
      var model = `${case_db}_detail`;
      var table_name = `${case_db}_details`;
      var create_query =
        "CREATE TABLE " +
        table_name +
        "(id SERIAL PRIMARY KEY,case_id INTEGER," +
        model_create +
        ',"createdAt" TIMESTAMPTZ,"updatedAt" TIMESTAMPTZ)';
      var model_datatype = [];
      for (var m = 0; m < model_create.length; m++) {
        var split_model = model_create[m].split(" ");
        var datatypes;
        if (split_model[1] == "VARCHAR(255)") {
          datatypes = "STRING";
        } else if (split_model[1] == "TIMESTAMPTZ") {
          datatypes = "DATE";
        } else {
          datatypes = split_model[1];
        }
        model_datatype.push(`${split_model[0]}:DataTypes.${datatypes}`);
      }
      await pool.query(create_query);
      await pool.end();
      await fs.appendFile(
        "./models/" + model + ".js",
        `'use strict';
            module.exports = (sequelize, DataTypes) => {
                const ${model} = sequelize.define('${model}', {
                    case_id: DataTypes.INTEGER,
                    ${model_datatype}
                }, {});
                ${model}.associate = function (models) {
                    // associations can be defined here
                };
                return ${model};
            };`
      );
      res.json({
        status: 1
      });
    }
  }
});

router.get("/dynamic-form-builder/list", auth, async (req, res) => {
  // function notOnlyALogger(msg) {
  //   console.log("****log****");
  //   console.log(msg);
  // }
  // FormBuilder.belongsTo(RateList, { foreignKey: "case_type_id" });
  // const all_forms = await FormBuilder.findAll({
  //   logging: notOnlyALogger,
  //   group: ["case_type_id"],
  //   include: [
  //     {
  //       model: RateList
  //     }
  //   ]
  // });
  // FormBuilder.belongsTo(RateList, { foreignKey: "case_type_id" });
  // const all_forms = await FormBuilder.findAll({
  //   attributes: ["case_type_id"],
  //   logging: notOnlyALogger,
  //   group: ["case_type_id"]
  // });
  //console.log(JSON.stringify(all_forms, undefined, 2));

  const case_type = await RateList.findAll();

  res.render("dynamic_form/list", {
    layout: "dashboard",
    title: "Form List",
    case_type
  });
});

router.get(
  "/dynamic-form-builder/list/edit/:case_type_id",
  auth,
  async (req, res) => {
    const case_type_id = req.params["case_type_id"];
    const case_type = await RateList.findAll();
    var check_form = await FormBuilder.findAll({
      where: {
        case_type_id: case_type_id
      }
    });
    console.log(JSON.stringify(check_form, undefined, 2));
    res.render("dynamic_form/edit", {
      layout: "dashboard",
      title: "Form Builder Edit",
      case_type_id,
      case_type,
      check_form
    });
  }
);

router.post("/add/dynamic-form-builder-case-edit", auth, async (req, res) => {
  var case_type = req.body.case_type;
  console.log(case_type);
  var formbuilder = JSON.parse(req.body.formbuilder);
  console.log(formbuilder.length);
  //exit();
  if (formbuilder.length == "0") {
    res.json({
      status: 3
    });
  } else {
    var case_type_name = await RateList.findOne({
      where: {
        id: case_type
      }
    });
    var db_primary = case_type_name.type_of_case
      .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "")
      .toLowerCase();
    var case_db = db_primary.replace(/\s+/g, "_");
    var model = `${case_db}_detail`;
    var table_name = `${case_db}_details`;

    ////// Get all fields names of the specific table //////
    var show_columns =
      "SELECT column_name FROM information_schema.columns WHERE table_name = '" +
      table_name +
      "'";

    var show_columns_query = await pool.query(show_columns);
    console.log(show_columns_query);
    var field_length = show_columns_query.rows.length;
    console.log(field_length);
    var field_array = [];
    for (var fl = 0; fl < field_length; fl++) {
      //console.log(show_columns_query.rows[fl].column_name);
      field_array.push(show_columns_query.rows[fl].column_name);
    }
    console.log(field_array);

    var model_create = [];
    var alter_model = [];

    ////// Destroy existing model //////
    await FormBuilder.destroy({
      where: {
        case_type_id: case_type
      }
    });
    ////// Code to create model //////
    for (var f = 0; f < formbuilder.length; f++) {
      var field_name =
        formbuilder[f].name != undefined
          ? formbuilder[f].name.toLowerCase()
          : "";
      field_name = field_name.replace(/\s+/g, "_");
      field_name = field_name.split("-").join("_");
      if (formbuilder[f].type == "text") {
        model_create.push(field_name + " VARCHAR(255)");
      }
      if (formbuilder[f].type == "textarea") {
        model_create.push(field_name + " TEXT");
      }
      if (formbuilder[f].type == "radio-group") {
        model_create.push(field_name + " VARCHAR(255)");
      }
      if (formbuilder[f].type == "number") {
        model_create.push(field_name + " VARCHAR(255)");
      }
      if (formbuilder[f].type == "file") {
        model_create.push(field_name + " VARCHAR(255)");
      }
      if (formbuilder[f].type == "date") {
        model_create.push(field_name + " TIMESTAMPTZ");
      }
      if (formbuilder[f].type == "checkbox-group") {
        model_create.push(field_name + " VARCHAR(255)");
      }
      if (formbuilder[f].type == "autocomplete") {
        model_create.push(field_name + " VARCHAR(255)");
      }
      if (formbuilder[f].type == "select") {
        if (field_name == "court") {
          model_create.push(field_name + " INTEGER");
        } else {
          model_create.push(field_name + " VARCHAR(255)");
        }
      }

      ////// Code to get the new added fields //////
      var exists = field_array.includes(field_name);
      console.log(exists);
      if (exists == false) {
        //alter_model.push(field_name);
        //alter_model.push("ADD COLUMN" + field_name + " VARCHAR(255)");
        if (formbuilder[f].type == "text") {
          alter_model.push("ADD COLUMN " + field_name + " VARCHAR(255)");
        }
        if (formbuilder[f].type == "textarea") {
          alter_model.push("ADD COLUMN " + field_name + " TEXT");
        }
        if (formbuilder[f].type == "radio-group") {
          alter_model.push("ADD COLUMN " + field_name + " VARCHAR(255)");
        }
        if (formbuilder[f].type == "number") {
          alter_model.push("ADD COLUMN " + field_name + " VARCHAR(255)");
        }
        if (formbuilder[f].type == "file") {
          alter_model.push("ADD COLUMN " + field_name + " VARCHAR(255)");
        }
        if (formbuilder[f].type == "date") {
          alter_model.push("ADD COLUMN " + field_name + " TIMESTAMPTZ");
        }
        if (formbuilder[f].type == "checkbox-group") {
          alter_model.push("ADD COLUMN " + field_name + " VARCHAR(255)");
        }
        if (formbuilder[f].type == "autocomplete") {
          alter_model.push("ADD COLUMN " + field_name + " VARCHAR(255)");
        }
        if (formbuilder[f].type == "select") {
          if (field_name == "court") {
            alter_model.push("ADD COLUMN " + field_name + " INTEGER");
          } else {
            alter_model.push("ADD COLUMN " + field_name + " VARCHAR(255)");
          }
        }
      }

      ////// Form builder fields add //////
      await FormBuilder.create({
        case_type_id: req.body.case_type,
        input_type: formbuilder[f].type,
        name: field_name ? field_name : "",
        placeholder: formbuilder[f].placeholder
          ? formbuilder[f].placeholder
          : "",
        label: formbuilder[f].label,
        required: formbuilder[f].required ? formbuilder[f].required : "",
        sub_type: formbuilder[f].subtype,
        status: 0
      });
    }
    console.log(alter_model);
    var alter_query = "ALTER TABLE " + table_name + " " + alter_model;
    console.log(alter_query);
    await pool.query(alter_query);
    await pool.end();
    //console.log(model_create);
    //exit();

    ////// Delete existing table //////
    // var delete_table = "DROP TABLE " + table_name;
    // await pool.query(delete_table);
    //await pool.end();

    ////// Create new table //////
    // var create_query =
    //   "CREATE TABLE " +
    //   table_name +
    //   "(id SERIAL PRIMARY KEY,case_id INTEGER," +
    //   model_create +
    //   ',"createdAt" TIMESTAMPTZ,"updatedAt" TIMESTAMPTZ)';
    var model_datatype = [];
    for (var m = 0; m < model_create.length; m++) {
      var split_model = model_create[m].split(" ");
      var datatypes;
      if (split_model[1] == "VARCHAR(255)") {
        datatypes = "STRING";
      } else if (split_model[1] == "TIMESTAMPTZ") {
        datatypes = "DATE";
      } else {
        datatypes = split_model[1];
      }
      model_datatype.push(`${split_model[0]}:DataTypes.${datatypes}`);
    }
    // await pool.query(create_query);
    // await pool.end();

    ////// Delete existing model file //////
    //await fs.unlink("./models/" + model + ".js");
    await fs.unlink("./models/" + model + ".js", err => {
      if (err) {
        console.error(err);
        return;
      }
    });

    ////// Create new model file //////
    await fs.appendFile(
      "./models/" + model + ".js",
      `'use strict';
          module.exports = (sequelize, DataTypes) => {
              const ${model} = sequelize.define('${model}', {
                  case_id: DataTypes.INTEGER,
                  ${model_datatype}
              }, {});
              ${model}.associate = function (models) {
                  // associations can be defined here
              };
              return ${model};
          };`
    );

    res.json({
      status: 1
    });
  }
});

module.exports = router;
