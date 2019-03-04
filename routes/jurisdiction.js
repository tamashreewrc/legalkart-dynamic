const express = require('express');
const csrf = require('csurf');
const Jurisdiction = require('../models').jurisdiction;
const auth = require('../middlewares/auth');

var fs = require('fs');
var xlsx = require('node-xlsx');

const CityDetails = require('../models').city;
const StateDetails = require('../models').state;

var csrfProtection = csrf({
    cookie: true
})

const router = express.Router();

router.get("/jurisdiction", auth, async(req, res)=> {
    var success_add_jurisdiction = req.flash('add-jurisdiction')[0];
    var del_add_jurisdiction = req.flash('del-jurisdiction')[0];
    const jurisdiction = await Jurisdiction.findAll();
    res.render('jurisdiction/index', {
        layout: "dashboard",
        title: "Jurisdiction",
        success_add_jurisdiction,
        del_add_jurisdiction,
        jurisdiction
    });
});

router.get("/jurisdiction/add", auth, csrfProtection, (req, res)=> {
    res.render("jurisdiction/add", {
        layout: "dashboard",
        title: "Add Jurisdiction",
        csrfToken: req.csrfToken(),
    });
});

router.post("/jurisdiction/add", auth, csrfProtection, async (req, res) => {
    await Jurisdiction.create({
        name:req.body.name,
        remarks: req.body.remarks,
        status:0,
    });
    req.flash('add-jurisdiction', 'Jurisdiction Added Successfully');
    res.redirect('/jurisdiction');
});

router.post("/edit-jurisdiction", auth, async(req, res)=> {
    await Jurisdiction.update({
        name: req.body.edit_name,
        remarks: req.body.edit_remarks
    },{
        where: {
            id: req.body.juris_id
        }
    });
    res.json({
        success: true
    });
});

router.get("/jurisdiction/delete/:id", auth, async(req, res)=>{
    await Jurisdiction.destroy({
        where: {
            id: req.params['id']
        }
    });
    req.flash('del-jurisdiction', 'Jurisdiction Removed Successfully');
    res.redirect('/jurisdiction');
});

function convertToJSON(array) {
    var first = array[0].join()
    var headers = first.split(',');

    var jsonData = [];
    for (var i = 1, length = array.length; i < length; i++) {
        var myRow = array[i].join();
        var row = myRow.split(',');

        var data = {};
        for (var x = 0; x < row.length; x++) {
            data[headers[x]] = row[x];
        }
        jsonData.push(data);
    }
    return jsonData;
}


router.get("/upload-state", auth, async(req, res)=>{

    var referral_excel = xlsx.parse(fs.readFileSync('public/state.xlxs.ods'));
    var importedData = JSON.stringify(convertToJSON(referral_excel[0].data));
    var excelReferral = JSON.parse(importedData);
    var state = [];
    
    for (let i=0; i< excelReferral.length -1; i++) {
       

        // if (excelReferral[i].State == "Karnatka") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 110
        //     })
        // } else if (excelReferral[i].State == "Mizoram") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 111
        //     })
        // } else if (excelReferral[i].State == "Manipur") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 112
        //     })
        // }else if (excelReferral[i].State == "Meghalaya") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 113
        //     })
        // }else if (excelReferral[i].State == "Himachal Pradesh") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 114
        //     })
        // }else if (excelReferral[i].State == "Nagaland") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 115
        //     })
        // }else if (excelReferral[i].State == "Goa") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 116
        //     })
        // }else if (excelReferral[i].State == "Andaman and Nicobar Islands") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 117
        //     })
        // }else if (excelReferral[i].State == "Hardoi") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 118
        //     })
        // }else if (excelReferral[i].State == "Arunachal Pradesh") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 119
        //     })
        // }else if (excelReferral[i].State == "Rampur") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 120
        //     })
        // }else if (excelReferral[i].State == "Bulandshahr") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 121
        //     })
        // }else if (excelReferral[i].State == "Ajmer") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 122
        //     })
        // }else if (excelReferral[i].State == "Agra") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 123
        //     })
        // }else if (excelReferral[i].State == "Farrukhabad") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 124
        //     })

        // }else if (excelReferral[i].State == "Dadra and Nagar Haveli") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 127
        //     })
        // }else if (excelReferral[i].State == "Maharashtra") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 129
        //     })
        // }else if (excelReferral[i].State == "Delhi") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 130
        //     })
        // }else if (excelReferral[i].State == "Karnataka") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 132
        //     })
        // }else if (excelReferral[i].State == "Gujarat") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 132
        //     })
        // }else if (excelReferral[i].State == "Telangana") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 133
        //     })
        // }else if (excelReferral[i].State == "Tamil Nadu") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 134
        //     })
        // }else if (excelReferral[i].State == "West Bengal") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 135
        //     })
        // }else if (excelReferral[i].State == "Rajasthan") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 136
        //     })
        // }else if (excelReferral[i].State == "Uttar Pradesh") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 137
        //     })
        // }else if (excelReferral[i].State == "Bihar") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 138
        //     })
        // }else if (excelReferral[i].State == "Madhya Pradesh") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 139
        //     })
        // }else if (excelReferral[i].State == "Andhra Pradesh") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 140
        //     })
        // }else if (excelReferral[i].State == "Punjab") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 141
        //     })
        // }else if (excelReferral[i].State == "Jammu and Kashmir") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 142
        //     })
        // }else if (excelReferral[i].State == "Haryana") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 143
        //     })
        // }else if (excelReferral[i].State == "Jharkhand") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 144
        //     })
        // }else if (excelReferral[i].State == "Chhattisgarh") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 145
        //     })
        // }else if (excelReferral[i].State == "Assam") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 146
        //     })
        // }else if (excelReferral[i].State == "Chandigarh") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 147
        //     })
        // }else if (excelReferral[i].State == "Kerala") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 148
        //     })
        // }else if (excelReferral[i].State == "Odisha") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 159
        //     })
        // }else if (excelReferral[i].State == "Uttarakhand") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 150
        //     })
        // }else if (excelReferral[i].State == "Puducherry") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 151
        //     })
        // }else if (excelReferral[i].State == "Tripura") {
        //     await CityDetails.create({
        //         name: excelReferral[i].City,
        //         status: '0',
        //         state_id: 152
        //     })
        // }

    }
    console.log('Complete');


    let uniqueState = [...new Set(state)];
    // console.log(uniqueState);
    // for (let i=0; i<=uniqueState.length; i++) {
    //     StateDetails.create({
    //         name: uniqueState[i],
    //         status: '0'
    //     })
    // }
    
});




module.exports = router;