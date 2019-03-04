const express = require('express');
const auth = require('../middlewares/auth');
const csrf = require('csurf');
const multer = require('multer');
const Resource = require('../models').resource;

var csrfProtection = csrf({
    cookie: true
})

const router = express.Router();
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/resource_img');
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

router.get("/admin-resources", auth, async (req, res) => {
    var success_add_resource = req.flash('add-resource-Content')[0];
    var success_edit_resource = req.flash('edit-resource-Content')[0];
    var whereCondition = {};
    if(req.user.role_id == "2")
    {
        whereCondition.user_id = req.user.id
    }
    var resource = await Resource.findAll({
        where: whereCondition,
        order: [
            ['id', 'DESC']
        ]
    });
    res.render("resource/index", {
        layout: "dashboard",
        title: "Resources",
        success_add_resource,
        success_edit_resource,
        resource
    });
});

router.get("/admin-resources/add", auth, csrfProtection, async(req, res) => {
    res.render("resource/add", {
        layout: "dashboard",
        title: "Add Resources",
        csrfToken: req.csrfToken()
    });
});

router.post("/admin-resources/add", auth, profile.single('avatar'), csrfProtection, async (req, res) => {
    await Resource.create({
        resource_type: req.body.resource_type,
        name:req.body.name,
        avatar: `/resource_img/${req.file.filename}`,
        content: req.body.content,
        user_id: req.user.id,
        firm_id:req.user.firm_id,
        status:0
    });
    req.flash('add-resource-Content', 'Resource Added Successfully');
    res.redirect('/admin-resources');
});

router.get("/admin-resources/edit/:id", auth, csrfProtection, async(req, res)=> {
    var resource_edit = await Resource.findOne({
        where: {
            id: req.params['id']
        }
    });
    res.render("resource/edit", {
        layout: "dashboard",
        title: "Resources",
        resource_edit,
        csrfToken: req.csrfToken()
    });
});

router.post("/admin-resources/edit/:id", auth, profile.single('avatar'), csrfProtection, async (req, res) => {
    await Resource.update({
        resource_type: req.body.resource_type,
        name: req.body.name,
        avatar: (req.file === undefined) ? req.body.old_img : `/resource_img/${req.file.filename}`,
        content: req.body.content
    },{
        where: {
            id: req.params['id']
        }
    });
    req.flash('edit-resource-Content', 'Resource Updated Successfully');
    res.redirect('/admin-resources');
});

router.post("/resource/publish-status", auth, async(req, res) => {
    await Resource.update({
        status: 0
    },{
        where: {
            status: 1
        }
    });
    var resource_id = req.body.check_publish;
    for (var i = 0; i < resource_id.length; i++)
    {
        await Resource.update({
            status: 1
        },{
            where: {
                id: resource_id[i]
            }
        })
    }
    res.json({
        success: true
    })
});

module.exports = router;