const express = require('express');
const csrf = require('csurf');
const LegalService = require('../models').legal_service_category;
const SubLegalService = require('../models').legal_service_sub_category;
const LegalServiceContent = require('../models').legal_service_content;
const auth = require('../middlewares/auth');
const multer = require('multer');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

var csrfProtection = csrf({
    cookie: true
})


const router = express.Router();

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/legal_service_img');
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

router.get("/legal-service", auth, async(req, res)=> {
    var success_add_legal_service_category = req.flash('add-legal-service-category')[0];
    var success_del_legal_service_category = req.flash('del-legal-service-category')[0];
    LegalService.hasMany(SubLegalService, {
        foreignKey: 'legal_service_category_id'
    });
    const legal_service = await LegalService.findAll({
        include: [{
            model: SubLegalService
        }],
        order: [
            [SubLegalService, 'id', 'ASC']
        ]
    });
    res.render("legal_service/index",{
        layout: "dashboard",
        title: "Legal Service",
        legal_service,
        success_add_legal_service_category,
        success_del_legal_service_category
    });
});

router.get("/legal-service/add", auth, csrfProtection, async(req, res) => {
    const legal_service_head = await LegalService.findAll();
    const legal_service_sub = await SubLegalService.findAll({
        where: {
            sub_head: 0
        }
    });
    res.render("legal_service/add",{
        layout: "dashboard",
        title: "Add Legal Service",
        csrfToken: req.csrfToken(),
        legal_service_head,
        legal_service_sub
    });
});

router.post("/legal_service/add", auth, csrfProtection, async(req, res)=> {
    if (req.body.legal_advice_menu1 == "0")
    {
        await LegalService.create({
            name: req.body.legal_service_name,
            status: 0
        });
    }
    else
    {
        await SubLegalService.create({
            legal_service_category_id: req.body.legal_advice_menu1,
            name: req.body.legal_service_name,
            sub_head: req.body.legal_advice_menu2,
            status: 0
        });
    }
    var find_head = await SubLegalService.findAll({
        where: {
            sub_head: {
                [Op.ne]: 0
            }
        }
    });
    var names = [];
    for (var i = 0; i < find_head.length; i++) {
        names.push(find_head[i].sub_head);
    }
    let x = (names) => names.filter((v, i) => names.indexOf(v) === i)
    await SubLegalService.update({
        status: 1
    }, {
        where: {
            id: x(names)
        }
    });
    req.flash('add-legal-service-category', 'Legal Service Category Added Successfully');
    res.redirect('/legal-service');
});

router.post("/legal-service-categry/delete", auth, async(req, res) => {
    await SubLegalService.destroy({
        where: {
            id: req.body.legal_service_id
        }
    });
    req.flash('del-legal-service-category', 'Legal Service Category Removed Successfully');
    res.redirect('/legal-service');
});

router.post("/legal-service-category/publish-status", auth, async(req, res) => {
    await SubLegalService.update({
        publish_status: 0
    },{
        where: {
            publish_status: 1
        }
    });
    var legal_service_id = req.body.check_publish;
    for (var i = 0; i < legal_service_id.length; i++)
    {
        await SubLegalService.update({
            publish_status: 1
        },{
            where: {
                id: legal_service_id[i]
            }
        })
    }
    res.json({
        success: true
    })
});

router.get("/legal-service-content", auth, async(req, res)=> {
    var success_add_legal_service_content = req.flash('add-legal-service-Content')[0];
    var success_edit_legal_service_content = req.flash('edit-legal-service-Content')[0];
    LegalServiceContent.belongsTo(SubLegalService, {
        foreignKey: 'legal_service_sub_id'
    });
    const legal_advice_content = await LegalServiceContent.findAll({
        include:[{
            model: SubLegalService
        }]
    });
    // console.log(legal_advice_content)
    res.render("legal_service/add_cms",{
        layout: "dashboard",
        title: "Add Legal Service Content",
        success_add_legal_service_content,
        success_edit_legal_service_content,
        legal_advice_content
    });
});

router.get("/legal-service-content/add", auth, csrfProtection, async (req, res) => {
    const legal_service_head = await LegalService.findAll();
    res.render("legal_service/create_add_cms",{
        layout: "dashboard",
        title: "Add Legal Service Content",
        csrfToken: req.csrfToken(),
        legal_service_head
    });
});

router.post("/get-sub-legal-service-category", auth, async(req, res)=> {
    const sub_legal_service_category = await SubLegalService.findAll({
        where: {
            legal_service_category_id: req.body.legal_advice_head_id,
            status: 0
        }
    });
    res.json({
        sub_legal_service_category: sub_legal_service_category
    })
});

router.post("/legal-service-content/add", auth, profile.single('avatar'), csrfProtection, async (req, res) => {
    await LegalServiceContent.destroy({
        where: {
            legal_service_sub_id: req.body.legal_advice_sub
        }
    });
    await LegalServiceContent.create({
        legal_service_id: req.body.legal_advice_head,
        legal_service_sub_id:req.body.legal_advice_sub,
        avatar: `/legal_service_img/${req.file.filename}`,
        content:req.body.content,
        status:0      
    });
    req.flash('add-legal-service-Content', 'Legal Service Content Added Successfully');
    res.redirect('/legal-service-content');
});

router.get("/legal-service-content/edit/:id", auth, csrfProtection, async(req, res)=> {
    const legal_service_head = await LegalService.findAll();
    const legal_advice_content = await LegalServiceContent.findOne({
        where: {
            id: req.params['id']
        }
    });
    const sub_legal_service_category = await SubLegalService.findAll({
        where: {
            legal_service_category_id: legal_advice_content.legal_service_id,
            status: 0
        }
    });
    res.render("legal_service/edit_cms",{
        layout: "dashboard",
        title: "Edit Legal Service content",
        csrfToken: req.csrfToken(),
        legal_advice_content,
        legal_service_head,
        sub_legal_service_category
    })
});

router.post("/legal-service-content/edit/:id", auth, profile.single('avatar'), csrfProtection, async (req, res) => {
    await LegalServiceContent.update({
        legal_service_id: req.body.legal_advice_head,
        legal_service_sub_id: req.body.legal_advice_sub,
        avatar: (req.file === undefined) ? req.body.old_pic : `/legal_service_img/${req.file.filename}`,
        content: req.body.content,
        status: 0
    },{
        where: {
            id:req.params['id'] 
        }
    });
    req.flash('edit-legal-service-Content', 'Legal Service Content Updated Successfully');
    res.redirect('/legal-service-content');
});

module.exports = router;