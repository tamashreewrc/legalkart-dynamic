const express = require('express');
const csrf = require('csurf');
const auth = require('../middlewares/auth');
const CorporateCustomerAuth = require('../middlewares/corporate_cust_auth');
const RateList = require('../models').rate_list;
const User = require('../models').user;
const CaseType = require('../models').case_type;
const Court = require('../models').court;
const AllCase = require('../models').all_case;
const cab_case_detail = require('../models').cab_case_detail;
const CabCaseDetail = require('../models').cab_case_detail;
const LawyerModule = require('../models').lawyer;
const UserDetails = require('../models').user;
const Firm = require('../models').firm;
const lawyerAssignment = require('../models').lawyer_assignment;
const Conversation = require('../models').conversation;
const CaseDetails = require('../models').cab_case_detail;
const Fileuploads = require('../models').file_for_case;
const Notifications = require('../models').notification;
const Customer = require('../models').customer;
const BulkCase = require('../models').bulk_case;
const Rate = require('../models').rate;
const AdditionalCostCaseFile = require('../models').additional_cost_case_file;
const AdditionalCostCase = require('../models').additional_cost_case;
const AdditionalAllExpence = require('../models').additional_all_expence;
const CaseStatusCategory = require('../models').case_status_category;
const CaseStatusName = require('../models').case_status_name;
const AllCaseStatus = require('../models').all_case_status;
const MactCaseDetail = require('../models').mact_case_detail;
const multer = require('multer');
const xlsx = require('node-xlsx');
var moment = require('moment');
var fs = require('fs');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const Cryptr = require('cryptr');
const cryptr = new Cryptr('myTotalySecretKey');
const nodemailer = require('nodemailer');
var mailjet = require('node-mailjet')
    .connect("cb9aedd05c4497d14bc18308ddfa749b", "815b7221401f44db6ad460df71b5c6a6")

//notification module for app
var FCM = require('fcm-node');
var serverKey = 'AAAAKwtUK1M:APA91bF50-tA2wM0y6g8U9NUHavc9SjAKkfd5c3bz8lld_PSajWQ4CcbsQtydaLcqQkCnUJcvogurDJXG3C708KVioN4C65zSVR5KyJLSA-PXqCHye92h-Gh7M9qMKvTz93-tJAErrH5'; //put your server key here
var fcm = new FCM(serverKey);

var zip = require('express-easy-zip');
var fs      = require('fs');
var path = require("path");
const accountSid = 'ACebc0a918935d92408750e84a3f040725';
const authToken = '9abd6938cec25311e157561e3275cc7e';
const client = require('twilio')(accountSid, authToken);
var router = express.Router();
router.use(zip());

//url
const url = require('url');
 

//lodash
var _ = require('lodash');

//zip module
var AdmZip = require('adm-zip');

var csrfProtection = csrf({
    cookie: true
})


var fileExt = '';
var fileName = '';


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/upload_cases');
    },
    filename: function (req, file, cb) {
        fileExt = file.originalname.split('.')[1];
        fileName = req.user.id + '-' + Date.now() + '.' + fileExt;
        cb(null, fileName);
    }
});

var uploadCases = multer({
    storage: storage
});

/** Upload File */
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/upload_Files');
    },
    filename: function (req, file, cb) {
        fileExt = file.originalname.split('.')[1];
        fileName = req.user.id + '-' + Date.now() + '.' + fileExt;
        cb(null, fileName);
    }
});

// var uploadCases1 = multer({
//     storage: storage_
// });

// var storage = multer.diskStorage({
//     destination: function (req, file, callback) {
//         callback(null, 'public/upload_Files');
//     },
//     filename: function (req, file, callback) {
//         callback(null, file.fieldname + '-' + Date.now());
//     }
// });

var upload = multer({
    storage: storage
});


var fileName = "";
var storage1 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/upload_cases_file');
    },
    filename: function (req, file, cb) {
        fileExt = file.mimetype.split('/')[1];

        fileName = req.user.id + '-' + Date.now() + '.' + fileExt;
        cb(null, fileName);
    }
});


var profile1 = multer({
    storage: storage1
});

var storage_additional_cost_file = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/upload_additional_cost_file');
    },
    filename: function (req, file, cb) {
        fileExt = file.mimetype.split('/')[1];

        fileName = req.user.id + '-' + Date.now() + '.' + fileExt;
        cb(null, fileName);
    }
});


var additional_cost_file = multer({
    storage: storage_additional_cost_file
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


router.get("/my-cases", auth, CorporateCustomerAuth, async (req, res) => {
    var success_add_cases = req.flash('add-CT1-case')[0];
    const case_type = await CaseType.findAll({
        order: [
            ['id', 'DESC']
        ]
    });
    res.render("case/index", {
        layout: "dashboard",
        title: "All Cases",
        case_type,
        success_add_cases
    });
});

router.get("/my-cases/view-cases/:case_type", auth, CorporateCustomerAuth, async (req, res) => {
    var allCase = {};
    allCase.case_type = req.params['case_type']
    if (req.user.role_id == 3) {
        allCase.firm_id = req.user.firm_id
    } else if (req.user.role_id == 5) {
        allCase.customer_id = req.user.id
    }
    AllCase.hasMany(CabCaseDetail, {
        foreignKey: 'case_id'
    });
    const all_cases = await AllCase.findAll({
        where: allCase,
        include: [{
            model: CabCaseDetail
        }],
        order: [
            ['id', 'DESC']
        ]
    });
    res.render("case/view_case", {
        layout: "dashboard",
        title: "View All Cases",
        all_cases
    })
});

router.get("/case/add/:id", auth, CorporateCustomerAuth, csrfProtection, async (req, res) => {
    const rateList = await RateList.findAll();
    const case_type = await CaseType.findById(req.params['id']);
    const court = await Court.findAll({
        order: [
            ['name', 'ASC'],
        ],
    });
    res.render("case/add", {
        layout: "dashboard",
        title: "Add Case",
        csrfToken: req.csrfToken(),
        case_type,
        court,
        rateList
    })
});

router.get("/legalcart-case/add", auth, CorporateCustomerAuth, csrfProtection, async (req, res) => {
    const rateList = await RateList.findAll({
        where: {
            id: {
                [Op.notIn]: [2,6,7]
            }
        }
    });
    const court = await Court.findAll({
        order: [
            ['name', 'ASC'],
        ],
    });
    res.render("case/all_case_add", {
        layout: "dashboard",
        title: "Add Case",
        csrfToken: req.csrfToken(),
        court,
        rateList
    })
});


router.get("/cases/list", auth, csrfProtection, async (req, res) => {
    const all_case = await CaseType.findAll();
    res.render("case/list", {
        layout: "dashboard",
        title: "Add Case",
        csrfToken: req.csrfToken(),
        all_case,
    })
});


router.get("/cases/all/:caseType", auth, csrfProtection, async (req, res) => {
    var file_assignment = req.flash('file-assign')[0];

    const lawyerDetails = await UserDetails.findAll({
        where: {
            role_id: 2
        }
    });

    const all_case = await AllCase.findAll({
        where: {
            case_type: req.params['caseType']
        }
    });

    const filesAll = await Fileuploads.findAll({
        where: {
            status: 0
        }
    });

    var lawyerAsign = []

    for (let i = 0; i < all_case.length; i++) {
        var lawyerAssignmentDetails = await lawyerAssignment.findAll({
            where: {
                case_id: all_case[i].id
            }
        });

        var fileuploadsAssign = await Fileuploads.findAll({
            where: {
                case_id: all_case[i].id
            }
        });

        lawyerAsign.push({
            'id': all_case[i].id,
            'case_no': (all_case[i].case_no == 0) ? all_case[i].cab_no : all_case[i].case_no,
            'case_type': all_case[i].case_type,
            'assign': (lawyerAssignmentDetails.length > 0) ? 1 : 0,
            'assign_file': (fileuploadsAssign.length > 0) ? 1 : 0,
            'status': all_case[i].status
        })
    }

    res.render("case/all_cases", {
        layout: "dashboard",
        title: "Add Case",
        csrfToken: req.csrfToken(),
        all_case,
        lawyerDetails,
        filesAll,
        caseType: req.params['caseType'],
        lawyerAsign,
        file_assignment
    });
});

router.post("/files-assign", auth, async (req, res) => {
    let lengthFile = req.body.fileList.length;
    for (let i = 0; i < lengthFile; i++) {
        await Fileuploads.update({
            case_id: req.body.hiddenFileId,
            status: 1
        }, {
            where: {
                id: req.body.fileList[i]
            }
        });
    }

    req.flash('file-assign', 'File Assigned Successfully');
    // res.redirect('/cases/all/' + req.body.caseTypeHidden);
    res.redirect('legalcart-challan');
});

router.post("/challan/case/files/assign", auth, csrfProtection, async (req, res) => {

    for (let i = 0; i < req.body.fileList.length; i++) {
        await Fileuploads.update({
            case_id: req.body.hiddenFileId,
            status: 1
        }, {
            where: {
                id: req.body.fileList[i]
            }
        });
    }

    // await AllCase.update({
    //     status: '3'
    // }, {
    //     where: {
    //         id: req.body.hiddenFileId
    //     }
    // });

    var caseid = await AllCase.findOne({
        where: {
            id: req.body.hiddenFileId
        }
    });

    // var bulkCase =  await BulkCase.findOne({
    //     where: {
    //         id:caseid.bulk_case_id
    //     }
    // });

    // console.log('Bulk',bulkCase)

    // await BulkCase.update({
    //     case_length: bulkCase.case_length - 1
    // },{
    //     where: {
    //         id:caseid.bulk_case_id
    //     }
    // })

    req.flash('lawyer-assigned', 'File Assign Successfully');
    res.redirect('/challan/case/list/' + caseid.bulk_case_id);
});

router.get("/my-caces", auth, csrfProtection, async (req, res) => {
    var casedetails = [];

    const lawyerDetails = await lawyerAssignment.findAll({
        where: {
            lawyer_id: req.user.id
        }
    });
    if (lawyerDetails.length != "0") {
        AllCase.hasMany(cab_case_detail, {
            foreignKey: 'case_id'
        });

        for (let i = 0; i < lawyerDetails.length; i++) {
            var casedetailsList = await AllCase.findAll({
                where: {
                    id: lawyerDetails[i].case_id
                },
                include: [{
                    model: cab_case_detail
                }],
                order: [
                    ['id', 'DESC']
                ]
            })
            casedetails.push(casedetailsList[0])
        }
    }

    res.render("case/my_cases", {
        layout: "dashboard",
        title: "Add Case",
        csrfToken: req.csrfToken(),
        casedetails
    });
});

router.get("/case-conversation/:id", auth, csrfProtection, async (req, res) => {
    if(req.user.role_id != "1")
    {
        const check_user = await Conversation.findOne({
            where: {
                case_id: req.params['id'],
                status: 0
            }
        });
        if(check_user)
        {
            if(req.user.role_id != "3")
            {
                if(check_user.user_id != req.user.id)
                {
                    await Conversation.update({
                        status: 1
                    },{
                        where: {
                            case_id: req.params['id'],
                            status: 0
                        }
                    });
                }
            }
        }
    }
     
    var converSactionDetails = []
    const conversation = await Conversation.findAll({
        where: {
            case_id: req.params['id']
        },
        order: [
            ['id', 'ASC']
        ],
    });

    for (let i = 0; i < conversation.length; i++) {
        var userDetails = await UserDetails.findAll({
            where: {
                id: conversation[i].user_id
            }
        })


        converSactionDetails.push({
            'name': userDetails[0].role_id == '2'? 'Legalkart': userDetails[0].first_name + " " + userDetails[0].last_name,
            'message': conversation[i].c_msg,
            'date': conversation[i].createdAt,
            'img': userDetails[0].avatar,
            'c_image': conversation[i].c_image,
            'extension': conversation[i].c_image.split('.').pop()
        })
    }

    var allCaseDetails = await AllCase.findOne({
        where: {
            id: req.params['id']
        }
    });

    const caseDetails = await CaseDetails.findOne({
        where: {
            'case_id': req.params['id']
        }
    })
    const mact_cases = await MactCaseDetail.findOne({
        where: {
            'case_id': req.params['id']
        }
    })

    if (mact_cases != null) {
        var courtName = await Court.findOne({
            where: {
                id: mact_cases.court_id
            }
        })
    }
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
            case_id: req.params['id']
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
            case_id: req.params['id']
        },
        include:[{
            model:AdditionalCostCaseFile
        },{
            model: AdditionalAllExpence
        }]
    });
    var case_status_category = await CaseStatusCategory.findAll();
    var case_status_name = await CaseStatusName.findAll();
    var case_status = await AllCaseStatus.findOne({
        where: {
            case_id: req.params['id']
        }
    })
    var add_fee_details = AdditionalCost == null ? "1" : "2";
    res.render("case/case_conversation", {
        layout: "dashboard",
        title: "View Conversation",
        csrfToken: req.csrfToken(),
        case_id: req.params['id'],
        conversations: converSactionDetails,
        allCaseDetails,
        caseDetails,
        courtName: courtName ? courtName : "",
        filesAll,
        user_id: req.user.role_id,
        caseType,
        lawyer_rate: lawyer_rate.rate_lawyers,
        AdditionalCost: AdditionalCost ? AdditionalCost : "",
        case_status_category,
        case_status_name,
        case_status,
        mact_cases,
        add_fee_details
    });

});

router.post('/case-close-legalcart', auth, additional_cost_file.array('additional_cost_file_admin'), async (req, res) => {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd;
    }

    if (mm < 10) {
        mm = '0' + mm;
    }

    today = dd + '/' + mm + '/' + yyyy;
    var expence = [];
    var tot_rate_admin = [];
    var expence_name = req.body.addi_expence_admin;
    var expence_amount = req.body.tot_addi_cost_admin;
    if(expence_name)
    {
        for (var d = 0; d < expence_name.length; d++) {
            if (expence_name[d] !== "") {
                var ddd = expence_name[d];
                var uuu = expence_amount[d];
                tot_rate_admin.push(parseInt(expence_amount[d]));
                expence.push({
                    "expence_name": ddd,
                    "expence_amount": uuu,
                });
            }
        }
    }
    var total_rate = tot_rate_admin.reduce((a, b) => a + b, 0);
    var addi_cost_fetch = await AdditionalCostCase.findOne({
        where: {
            case_id: req.body.case_id_close_will
        }
    });
    for (let i = 0; i < req.files.length; i++) {
        await AdditionalCostCaseFile.create({
            additional_cost_case_id: addi_cost_fetch.id,
            file_name: "/upload_additional_cost_file/"+req.files[i].filename,
            status: 0
        });
    }
    if(expence.length != "0")
    {
        for (var e = 0; e < expence.length; e++) {
            const edu = await AdditionalAllExpence.create({
                additional_cost_case_id: addi_cost_fetch.id,
                name: expence[e].expence_name,
                amount: expence[e].expence_amount,
                status: 0,
                user_id: req.user.id
            });
        }
    }
    var addi_cost_update = await AdditionalCostCase.update({
        admin_add_fee : total_rate
    },{
        where: {
            id: addi_cost_fetch.id
        }
    });

    await AllCase.update({
        closeing_status: 1,
        close_case_date: today
    }, {
        where: {
            id: req.body.case_id_close_will
        }
    });

    req.flash('add-status-close-case', 'Case Closed Successfully');
    if (req.body.case_type_id == 7) {
        res.redirect('/legalcart-challan');
    } else if (req.body.case_type_id == 6) {
        res.redirect('/legalcart-superdari');
    }
    else if (req.body.case_type_id == 2) {
        res.redirect('/legalcart-mact');
    }
});

// router.post("/lawyer/assignment", auth, async (req, res) => {

//     var caseLength = await lawyerAssignment.findOne({
//         where: {
//             case_id: req.body.case_id,
//             lawyer_id: req.body.lawyer_id
//         }
//     })

//     // notification for app 
//     const useiDetails = await User.findOne({
//         where: {
//             id: req.body.lawyer_id
//         }
//     });

//     const caseDetails = await AllCase.findOne({
//         where:{
//             id: req.body.case_id
//         }
//     });

//     //notification for web
//     await Notifications.create({
//         name: `${req.user.first_name} ${req.user.last_name}`,
//         remarks:`${caseDetails.cab_no} has been assign to you`,
//         status: 1,
//         sender_id:req.user.id,
//         receive_id: req.body.lawyer_id,
//         img: req.user.avatar,
//         link: `/case-conversation/${req.body.case_id}`
//     });

//     // notification for app
//     var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
//         to: useiDetails.device_fcm_id,
//         collapse_key: 'green',

//         notification: {
//             title: 'LEGALKART',
//             body: `LEGALKART:-Congratulation! ${caseDetails.cab_no} has been assign to you`
//         },
//     };

//     fcm.send(message, (err, response) => {
//         if (err) {
//             console.log("Something has gone wrong!");
//         } else {
//             console.log("Successfully sent with response: ", response);
//         }
//     });


//     if (caseLength == null) {
//         await lawyerAssignment.create({
//             lawyer_id: req.body.lawyer_id,
//             case_id: req.body.case_id,
//             status: 0
//         });

//         await AllCase.update({
//             status: '3'
//         }, {
//             where: {
//                 id: req.body.case_id
//             }
//         })
//     } else {
//         var msg = "You have Already Assign"
//     }

//     res.json({
//         success: true,
//         msg
//     })
// });

router.post("/lawyer/challan/case/assignment", auth, async (req, res) => {


    var caseLength = await lawyerAssignment.findOne({
        where: {
            case_id: req.body.hiddencaseId,
            lawyer_id: req.body.laywerList
        }
    });
    const useiDetails = await User.findOne({
        where: {
            id: req.body.laywerList
        }
    });

    const caseDetails = await AllCase.findOne({
        where:{
            id:req.body.hiddencaseId
        }
    });
    var case_type = await RateList.findOne({
        where: {
            id: caseDetails.case_type_id
        }
    })

    //notification for web
    await Notifications.create({
        name: `Admin`,
        remarks: `You have been assigned 1 New ${case_type.type_of_case}.`,
        status: 1,
        sender_id:req.user.id,
        receive_id: req.body.laywerList,
        img: req.user.avatar,
        // link: `/case-conversation/${req.body.hiddencaseId}`
        link: `/case-invitation`
    });

    // notification for app
    var message = { 
        to: useiDetails.device_fcm_id,
        collapse_key: 'green',

        notification: {
            title: 'LEGALKART',
            body: `LEGALKART:-Congratulation! You have been assigned 1 New ${case_type.type_of_case}.`
        },

    };

    fcm.send(message, (err, response) => {
        if (err) {
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });
            var oldlawyer = await lawyerAssignment.findOne({
                where: {
                    case_id: req.body.hiddencaseId,
                    invitation_status: 0
                }
            });
            if(oldlawyer)
            {
                await lawyerAssignment.update({
                    invitation_status: 1
                },{
                    where: {
                        id: oldlawyer.id
                    }
                })
                var caseid = await AllCase.findOne({
                    where: {
                        id: req.body.hiddencaseId
                    }
                });
                var bulkCase_ =  await BulkCase.findOne({
                    where: {
                        id:caseid.bulk_case_id
                    }
                });
            
                await BulkCase.update({
                    case_length: parseInt(bulkCase_.case_length) + 1
                },{
                    where: {
                        id:caseid.bulk_case_id
                    }
                })
            }
    // if (caseLength == null) {
    // } 
            await lawyerAssignment.create({
                lawyer_id: req.body.laywerList,
                case_id: req.body.hiddencaseId,
                status: 0
            });
    
            await AllCase.update({
                status: '3',
                invitation: 0
            }, {
                where: {
                    id: req.body.hiddencaseId
                }
            });

    var caseid = await AllCase.findOne({
        where: {
            id: req.body.hiddencaseId
        }
    });


    var bulkCase =  await BulkCase.findOne({
        where: {
            id:caseid.bulk_case_id
        }
    });

    await BulkCase.update({
        case_length: parseInt(bulkCase.case_length) - 1
    },{
        where: {
            id:caseid.bulk_case_id
        }
    })

    req.flash('lawyer-assigned', 'Lawyer Assign Successfully');
    res.redirect('/challan/case/list/' + caseid.bulk_case_id);
});

router.post("/lawyer/show/for-assignment/", auth, async (req, res) => {
    var lawyerDetails;

    if (req.body.type == 'C') {
        var allCase = await AllCase.findAll({
            where: {
                bulk_case_id: req.body.bulkid
            }
        });
        var lawyers_id = []
        var lawyerAssign = await lawyerAssignment.findAll({
            where:{
                case_id: req.body.case_id,
                invitation_status: 1
            }
        })

        lawyerAssign.forEach((data) => {
            lawyers_id.push(data.lawyer_id);
        })
        UserDetails.hasMany(LawyerModule, {
            foreignKey: 'lawyer_id'
        });
    
        lawyerDetails = await UserDetails.findAll({
            where: {
                role_id: 2,
                state_id:allCase[0].state_id,
                id: {
                    [Op.notIn]: lawyers_id
                }
            },
            include: [{
                model: LawyerModule
            }]
        });
    } else if (req.body.type == 'M') {
        for (let case_id of req.body.case_id) {

            var allCase = await AllCase.findAll({
                where: {
                    id: case_id
                }
            });

            UserDetails.hasMany(LawyerModule, {
                foreignKey: 'lawyer_id'
            });
        
            lawyerDetails = await UserDetails.findAll({
                where: {
                    role_id: 2,
                    state_id:allCase[0].state_id
                },
                include: [{
                    model: LawyerModule
                }]
            });

        }
        
    } else if (req.body.type == 'R') {
        // Reassign -28-02-19
        var allCase = await AllCase.findAll({
            where: {
                bulk_case_id: req.body.bulkid
            }
        });
    
        var lawyers_id = []
        var lawyerAssign = await lawyerAssignment.findAll({
            where:{
                case_id: req.body.case_id,
            }
        })

        lawyerAssign.forEach((data) => {
            lawyers_id.push(data.lawyer_id);
        })

        //console.log(lawyers_id);

        UserDetails.hasMany(LawyerModule, {
            foreignKey: 'lawyer_id'
        });
    
        lawyerDetails = await UserDetails.findAll({
            where: {
                role_id: 2,
                state_id:allCase[0].state_id,
                id: {
                    [Op.notIn]: lawyers_id
                }
            },
            include: [{
                model: LawyerModule
            }]
        });
    }
    
    res.json({
        success: true,
        lawyerDetails
    });

    
});

router.post("/upload-case-excel", auth, uploadCases.array('file_name_type_1'), async (req, res) => {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd;
    }

    if (mm < 10) {
        mm = '0' + mm;
    }

    today = dd + '/' + mm + '/' + yyyy;
    var upload_case = xlsx.parse(fs.readFileSync('public/upload_cases/' + fileName));
    var importedData = JSON.stringify(convertToJSON(upload_case[0].data));
    var excelCases = JSON.parse(importedData);
    var bulkCaseCreate = await BulkCase.create({
        user_id: req.user.id,
        firm_id: req.user.firm_id,
        case_length: excelCases.length,
        status: '0',
        excel_file_name: '/upload_cases/' + fileName,
        case_type_id: req.body.case_type_id
    });
    var current_length = [];
    for (var i = 0; i < excelCases.length; i++) {
        if (excelCases[i].cab_no) 
        {
            var duplicate_case = await AllCase.findAll({
                where: {
                    cab_no: excelCases[i].cab_no,
                    case_type_id: req.body.case_type_id,
                    createdAt: {
                        $gte: moment().subtract(7, 'days').toDate()
                    }
                }
            });
            if (duplicate_case.length == "0") {
                current_length.push(i);
                
                var court = await Court.findOne({
                    where: {
                        name: excelCases[i].court_name
                    }
                });
                var court_id;
                if(court == null)
                {
                    var add_new_court = await Court.create({
                        name: excelCases[i].court_name,
                    });
                    court_id = add_new_court.id
                }
                else
                {
                    court_id= court.id;
                }
                //const date_of_assign = excelCases[i].date_of_assignment ? excelCases[i].date_of_assignment.split("/") : '';
                var case_add = await AllCase.create({
                    case_no: 0,
                    cab_no: excelCases[i].cab_no,
                    customer_id: req.user.id,
                    case_type: 'CT1',
                    status: 0,
                    firm_id: req.user.firm_id,
                    city_id: req.user.city_id,
                    state_id: req.user.state_id,
                    case_type_id: req.body.case_type_id,
                    bulk_case_id: bulkCaseCreate.id,
                    create_case_date:today
                });
                var case_other_add = await CabCaseDetail.create({
                    case_id: case_add.id,
                    date_of_assignment: new Date(),
                    impound_status: excelCases[i].impound_status,
                    name_of_ps: excelCases[i].name_of_ps,
                    judge_name: excelCases[i].judge_name,
                    court_id: court_id,
                    driver_name: excelCases[i].driver_name,
                    driver_mobile: excelCases[i].driver_mobile_no,
                    advocate: "LegalKart"
                });
                await AllCaseStatus.create({
                    case_id: case_add.id,
                    case_status_id: 0,
                    case_status_category_id: 1,
                    status: 0,
                    user_id: 0,
                    customer_id: req.user.id,
                    firm_id:req.user.firm_id
                });
            }
        }
    }
    if (current_length.length == "0") {
        await BulkCase.destroy({
            where: {
                id: bulkCaseCreate.id
            }
        });
        req.flash('existing-CT1-cases', 'All Cases had been uploaded in between last 7 days');
        if (req.body.case_type_id == 7)
        {
            res.redirect('/legalcart-challan');
        }
        else if (req.body.case_type_id == 6)
        {
            res.redirect('/legalcart-superdari');
        }
    } else {
        await BulkCase.update({
            case_length: current_length.length
        }, {
            where: {
                id: bulkCaseCreate.id
            }
        });
        req.flash('bulk-id', `${bulkCaseCreate.id}`)
        req.flash('add-CT1-cases',  `${current_length.length} Cases has been uploaded and ${parseInt(excelCases.length) - parseInt(current_length.length)} cases has been removed.`);
        if (req.body.case_type_id == 7) {
            await Notifications.create({
                remarks: `${current_length.length} Challan Cases has been Added and ${parseInt(excelCases.length) - parseInt(current_length.length)} cases has been removed.`,
                receive_id: 1,
                status: 1,
                sender_id: req.user.id,
                img: req.user.avatar,
                name: req.user.first_name + " " + req.user.last_name,
                link: "/legalcart-challan"
            });
            res.redirect('/legalcart-challan');
        } else if (req.body.case_type_id == 6) {
            await Notifications.create({
                remarks: `${current_length.length} Superdari Cases has been Added and ${parseInt(excelCases.length) - parseInt(current_length.length)} cases has been removed.`,
                receive_id: 1,
                status: 1,
                sender_id: req.user.id,
                img: req.user.avatar,
                name: req.user.first_name + " " + req.user.last_name,
                link: "/legalcart-superdari"
            });
            res.redirect('/legalcart-superdari');
        }
    }
    
});


router.post("/upload-case-files", auth, upload.array('file_name_type_2'), async (req, res) => {
    for (let i = 0; i < req.files.length; i++) {
        await Fileuploads.create({
            name: `/upload_Files/${req.files[i].originalname}`,
            status: 0,
            case_id: 0,
            bulk_id: req.body.bulk_id? req.body.bulk_id:0,
            filename:req.files[i].filename,
        });
    }
    res.json({
        success: true
    })
    // req.flash('add-CT1-case', 'File Added Successfully');
    // if (req.body.case_type_id == 7) {
    //     res.redirect('/legalcart-challan');
    // } else if (req.body.case_type_id == 6) {
    //     res.redirect('/legalcart-superdari');
    // } else if (req.body.case_type_id == 2) {
    //     res.redirect('/legalcart-mact');
    // }
});

router.post("/case/add", auth, CorporateCustomerAuth, upload.array('file_name_type_2_manual'), csrfProtection, async (req, res) => {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd;
    }

    if (mm < 10) {
        mm = '0' + mm;
    }

    today = dd + '/' + mm + '/' + yyyy;
    var addAllCases = [];
    var cab_no = req.body.cab_no;
    var inpound_status = req.body.inpound_status;
    var name_of_ps = req.body.name_of_ps;
    var judge_name = req.body.judge_name;
    var court = req.body.court;
    var driver_name = req.body.driver_name;
    var driver_mobile_no = req.body.driver_mobile_no;

    var users = await UserDetails.findOne({
        where: {
            id: req.user.id
        }
    })

    for (var d = 0; d < cab_no.length; d++) {
        if (cab_no[d] !== "") {
            var c_no = cab_no[d];
            var ps = name_of_ps[d];
            var crt = court[d];
            var dname = driver_name[d];
            var dmob = driver_mobile_no[d];
            var uuu = inpound_status[d];
            var yyy = judge_name[d];
            addAllCases.push({
                "cab_no": c_no,
                "name_of_ps": ps,
                "court": crt,
                "driver_name": dname,
                "driver_mobile_no": dmob,
                "impound_status": uuu,
                "judge_name": yyy
            });
        }
    }
    if (addAllCases.length == 0) {
        req.flash('existing-CT1-cases', 'Cab No can not be blank');
        if (req.body.case_type_id == 7) {
            res.redirect('/legalcart-challan');
        } else if (req.body.case_type_id == 6) {
            res.redirect('/legalcart-superdari');
        }
    } else {
        var bulkCaseCreate = await BulkCase.create({
            user_id: req.user.id,
            firm_id: req.user.firm_id,
            case_length: addAllCases.length,
            status: '0',
            case_type_id: req.body.case_type_id
        });
        var current_length = [];
        for (var i = 0; i < addAllCases.length; i++) {
            var duplicate_case = await AllCase.findAll({
                where: {
                    cab_no: addAllCases[i].cab_no,
                    case_type_id: req.body.case_type_id,
                    createdAt: {
                        $gte: moment().subtract(7, 'days').toDate()
                    }
                }
            });
            if (duplicate_case.length == "0") {
                current_length.push(i);
                const date_of_assign = addAllCases[i].date_of_assign ? addAllCases[i].date_of_assign.split("/") : '';
                var case_add = await AllCase.create({
                    case_no: 0,
                    cab_no: addAllCases[i].cab_no,
                    customer_id: req.user.id,
                    case_type: 'CT1',
                    status: 0,
                    firm_id: req.user.firm_id,
                    case_type_id: req.body.case_type_id,
                    city_id: users.city_id,
                    state_id: users.state_id,
                    bulk_case_id: bulkCaseCreate.id,
                    create_case_date: today
                });
                var case_other_add = await CabCaseDetail.create({
                    case_id: case_add.id,
                    date_of_assignment: new Date(),
                    impound_status: addAllCases[i].impound_status,
                    name_of_ps: addAllCases[i].name_of_ps,
                    judge_name: addAllCases[i].judge_name,
                    court_id: addAllCases[i].court ? addAllCases[i].court : 0,
                    driver_name: addAllCases[i].driver_name,
                    driver_mobile: addAllCases[i].driver_mobile_no,
                    advocate: "LegalKart"
                });
                await AllCaseStatus.create({
                    case_id: case_add.id,
                    case_status_id: 0,
                    case_status_category_id: 1,
                    status: 0,
                    user_id: 0,
                    customer_id: req.user.id,
                    firm_id: req.user.firm_id
                });
            }
        }
        if (current_length.length == "0") {
            await BulkCase.destroy({
                where: {
                    id: bulkCaseCreate.id
                }
            });
            req.flash('existing-CT1-cases', 'All Cases had been uploaded in between last 7 days');
            if (req.body.case_type_id == 7) {
                res.redirect('/legalcart-challan');
            } else if (req.body.case_type_id == 6) {
                res.redirect('/legalcart-superdari');
            }
        } else {
            await BulkCase.update({
                case_length: current_length.length
            }, {
                where: {
                    id: bulkCaseCreate.id
                }
            });
            for (let i = 0; i < req.files.length; i++) {
                await Fileuploads.create({
                    name: `/upload_Files/${req.files[i].originalname}`,
                    status: 0,
                    case_id: 0,
                    bulk_id: bulkCaseCreate.id,
                    filename: req.files[i].filename
                });
            }
            req.flash('add-CT1-case', current_length.length + 'Cases Added Successfully');
            if (req.body.case_type_id == 7) {
                await Notifications.create({
                    remarks: `${current_length.length} Challan Cases has been Added.`,
                    receive_id: 1,
                    status: 1,
                    sender_id: req.user.id,
                    img: req.user.avatar,
                    name: req.user.first_name + " " + req.user.last_name,
                    link: "/legalcart-challan"
                });
                res.redirect('/legalcart-challan');
            } else if (req.body.case_type_id == 6) {
                await Notifications.create({
                    remarks: `${current_length.length} Superdari Cases has been Added.`,
                    receive_id: 1,
                    status: 1,
                    sender_id: req.user.id,
                    img: req.user.avatar,
                    name: req.user.first_name + " " + req.user.last_name,
                    link: "/legalcart-superdari"
                });
                res.redirect('/legalcart-superdari');
            }
        }
    }
});


router.post("/case/type/add", auth, upload.single('case_file'), CorporateCustomerAuth, csrfProtection, async (req, res) => {

    var users = await UserDetails.findOne({
        where: {
            id: req.user.id
        }
    })

    var caseDetails = await AllCase.create({
        case_no: req.body.case_no,
        cab_no: 0,
        customer_id: req.user.id,
        case_type: req.body.case_type,
        status: 0,
        firm_id: req.user.firm_id,
        description: req.body.case_description,
        case_type_id: req.body.case_type,
        city_id: users.city_id,
        state_id: users.state_id
    })

    await Fileuploads.create({
        name: req.file.originalname,
        status: 0,
        case_id: caseDetails.id
    });

    req.flash('add-CT1-case', 'Case Added Successfully');
    res.redirect('/legalcart-case');
});



router.post("/add/case/conversation", auth, profile1.single('conversationFile'), csrfProtection, async (req, res) => {
    await Conversation.create({
        case_id: req.body.case_id,
        user_id: req.user.id,
        c_msg: req.body.conversation,
        remarks: 'text',
        status: 0,
        c_image: (fileName === '') ? 'null' : `/upload_cases_file/${fileName}`
    });
    fileName = ''
    

    const caseDetails = await AllCase.findOne({
        where: {
            id: req.body.case_id
        }
    });
    //notification for web
    var receiver_id;
    if (req.user.role_id == "2") {
         var sendMsg = await User.findOne({
             where: {
                 firm_id: caseDetails.firm_id,
                 role_id: 3,
                 sub_role: "C"
             }
         });
         var sendMsgName = [];
         if (sendMsg.id == caseDetails.customer_id) {
             sendMsgName.push(sendMsg.id);
         } else {
             sendMsgName.push(sendMsg.id, caseDetails.customer_id);
         }
        for(var s=0; s<sendMsgName.length;s++)
        {
            await Notifications.create({
                name: `LegalKart`,
                remarks: `You got a message for cab no of ${caseDetails.cab_no}`,
                status: 1,
                sender_id: req.user.id,
                receive_id: sendMsgName[s],
                img: req.user.avatar,
                link: `/case-conversation/${req.body.case_id}`
            });
        }
    } else {
        const lawyer = await lawyerAssignment.findOne({
            where: {
                case_id: req.body.case_id
            }
        })
        if(req.user.role_id == "3")
        {
            await Notifications.create({
                name: `${req.user.first_name} ${req.user.last_name}`,
                remarks: `You got a message for cab no of ${caseDetails.cab_no}`,
                status: 1,
                sender_id: req.user.id,
                receive_id: caseDetails.customer_id,
                img: req.user.avatar,
                link: `/case-conversation/${req.body.case_id}`
            });
        }
        else
        {
            var sendMsgAdm = await User.findOne({
                where: {
                    firm_id: caseDetails.firm_id,
                    role_id: 3,
                    sub_role: "C"
                }
            });
            await Notifications.create({
                name: `${req.user.first_name} ${req.user.last_name}`,
                remarks: `You got a message for cab no of ${caseDetails.cab_no}`,
                status: 1,
                sender_id: req.user.id,
                receive_id: sendMsgAdm.id,
                img: req.user.avatar,
                link: `/case-conversation/${req.body.case_id}`
            });
        }
        if (lawyer != null)
        {
            const useiDetails = await User.findOne({
                where: {
                    id: lawyer.lawyer_id
                }
            });
            await Notifications.create({
                name: `${req.user.first_name} ${req.user.last_name}`,
                remarks: `You got a message for cab no of ${caseDetails.cab_no}`,
                status: 1,
                sender_id: req.user.id,
                receive_id: lawyer.lawyer_id,
                img: req.user.avatar,
                link: `/case-conversation/${req.body.case_id}`
            });
    
            // notification for app
            var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                to: useiDetails.device_fcm_id,
                collapse_key: 'green',
    
                notification: {
                    title: 'LEGALKART',
                    body: `LEGALKART:-You got a message for cab no of ${caseDetails.cab_no}.`
                },
            };
    
            fcm.send(message, (err, response) => {
                if (err) {
                    console.log("Something has gone wrong!");
                } else {
                    console.log("Successfully sent with response: ", response);
                }
            });
        }
    }
    
    res.redirect("/case-conversation/" + req.body.case_id);
});

router.post("/change-case-status", auth, additional_cost_file.array('additional_cost_file'), async (req, res) => {
    var govt_fee = [];
    var tot_rate_govt = [];
    var govt_fee_name = req.body.govt_fee_name;
    var govt_fee_amount = req.body.govt_fee_amount;
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
    var expence_name = req.body.addi_expence;
    var expence_amount = req.body.tot_addi_cost;
    if(expence_name)
    {
        for (var d = 0; d < expence_name.length; d++) {
            if (expence_name[d] !== "") {
                var ddd = expence_name[d];
                var uuu = expence_amount[d];
                expence.push({
                    "expence_name": ddd,
                    "expence_amount": uuu,
                });
            }
        }
    }
    var additional_cost =await AdditionalCostCase.create({
        case_id: req.body.case_ids,
        amount: req.body.tot_addi_expense ? req.body.tot_addi_expense : 0,
        govt_fee: total_rate,
        status: 0,
    });
    for (let i = 0; i < req.files.length; i++) {
        await AdditionalCostCaseFile.create({
            additional_cost_case_id: additional_cost.id,
            file_name: "/upload_additional_cost_file/"+req.files[i].filename,
            status: 0
        });
    }
    for (var q = 0; q < govt_fee.length; q++) {
        const edu = await AdditionalAllExpence.create({
            additional_cost_case_id: additional_cost.id,
            name: govt_fee[q].govt_fee_name,
            amount: govt_fee[q].govt_fee_amount,
            status: 0,
            user_id: req.user.id
        });
    }
    if(expence.length != "0")
    {
        for (var e = 0; e < expence.length; e++) {
            const edu = await AdditionalAllExpence.create({
                additional_cost_case_id: additional_cost.id,
                name: expence[e].expence_name,
                amount: expence[e].expence_amount,
                status: 0,
                user_id: req.user.id
            });
        }
    }

    req.flash('add-status-case', 'Fees Added Successfully');
    res.redirect(`/case-conversation/${req.body.case_ids}`);
    // if (req.body.case_type_id == 7) {
    //     res.redirect('/assign-challan-all');
    // } else if (req.body.case_type_id == 6) {
    //     res.redirect('/assign-superdari-all');
    // }
    // else if (req.body.case_type_id == 2) {
    //     res.redirect('/assign-mact-all');
    // }
});

/**
 * multiple lawyer assign
 */
router.post("/case/multi-assign-laywer", auth, async (req, res) => {

    // notification sectio for app
    const useiDetails = await User.findOne({
        where: {
            id: req.body.lawyer_id
        }
    });
    for (let i = 0; i < req.body.case_id.length; i++) {

        var caseLength = await lawyerAssignment.findOne({
            where: {
                case_id: req.body.case_id[i],
                lawyer_id: req.body.lawyer_id
            }
        })

        const caseDetails = await AllCase.findOne({
            where:{
                id: req.body.case_id[i]
            }
        });
        var case_type = await RateList.findOne({
            where: {
                id: caseDetails.case_type_id
            }
        })

        

        //case update
        var caseid = await AllCase.findOne({
            where: {
                id: req.body.case_id[i]
            }
        });

        var bulkCase =  await BulkCase.findOne({
            where: {
                id:caseid.bulk_case_id
            }
        });
    
    
        await BulkCase.update({
            case_length: bulkCase.case_length - 1
        },{
            where: {
                id:caseid.bulk_case_id
            }
        })

        //end case update
        // if (caseLength == null) {
        //     await lawyerAssignment.create({
        //         lawyer_id: req.body.lawyer_id,
        //         case_id: req.body.case_id[i],
        //         status: 0
        //     });

        //     await AllCase.update({
        //         status: '3'
        //     }, {
        //         where: {
        //             id: req.body.case_id[i]
        //         }
        //     })

        // } else {
        //     var msg = "You have Already Assign"
        // }

        // 26-02-2019
        await lawyerAssignment.create({
            lawyer_id: req.body.lawyer_id,
            case_id: req.body.case_id[i],
            status: 0
        });

        await AllCase.update({
            status: '3',
            invitation: 0
        }, {
            where: {
                id: req.body.case_id[i]
            }
        })
    }
    var link;
    if (req.body.caseTypeIdHidden == "6")
    {
        link = "/assign-superdari-all"
    }
    else if (req.body.caseTypeIdHidden == "7")
    {
        link = "/assign-challan-all"
    }
    else if (req.body.caseTypeIdHidden == "2")
    {
        link = "/assign-mact-all"
    }
    else
    {
        link = "/assign-case-all"
    }
    //notification for web
    await Notifications.create({
        name: `Admin`,
        remarks: `You have been assigned ${req.body.case_id.length} New ${req.body.caseTypeHidden}.`,
        status: 1,
        sender_id: req.user.id,
        receive_id: req.body.lawyer_id,
        img: req.user.avatar,
        //link: link
        link: `/case-invitation`
    });
    
    // notification sectio for app
    var message = { 
        to: useiDetails.device_fcm_id,
        collapse_key: 'green',

        notification: {
            title: 'LEGALKART',
            body: `LEGALKART:-Congratulation! You have been assigned ${req.body.case_id.length} New ${req.body.caseTypeHidden}.`
        },

    };

    fcm.send(message, (err, response) => {
        if (err) {
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });

    res.json({
        success: true,
        code: 200
    })
});


router.get("/legalcart-case", auth, async (req, res) => {
    var casedetails = {};
    var lawyerAsign = [];

    casedetails.cab_no = '0';
    if (req.user.role_id == 3) {
        casedetails.firm_id = req.user.firm_id
    } else if (req.user.role_id == 5) {
        casedetails.customer_id = req.user.id
    } 

    AllCase.hasMany(lawyerAssignment, {
        foreignKey: 'case_id'
    });

    AllCase.belongsTo(RateList, {
        foreignKey: 'case_type_id'
    });

    const all_cases = await AllCase.findAll({
        where: casedetails,
        order: [
            ['id', 'DESC']
        ],
        include: [{
            model: RateList
        },
         {
            model: lawyerAssignment
        }]
    });

    // console.log(all_cases[0].lawyer_assignments);
    

    /**
     * For super admin
     */

    var file_assignment = req.flash('file-assign')[0];

    const lawyerDetails = await UserDetails.findAll({
        where: {
            role_id: 2
        }
    });


    for (let i = 0; i < all_cases.length; i++) {
        var lawyerAssignmentDetails = await lawyerAssignment.findAll({
            where: {
                case_id: all_cases[i].id
            }
        });

        var fileuploadsAssign = await Fileuploads.findAll({
            where: {
                case_id: all_cases[i].id
            }
        });

        lawyerAsign.push({
            'id': all_cases[i].id,
            'case_no': all_cases[i].case_no,
            'case_type': all_cases[i].rate_list.type_of_case,
            'assign': (lawyerAssignmentDetails.length > 0) ? 1 : 0,
            'assign_file': (fileuploadsAssign.length > 0) ? 1 : 0,
            'status': all_cases[i].status,
            'description': all_cases[i].description,
            'closeing_status': all_cases[i].closeing_status,
            'bulk_case_id': all_cases[i].bulk_case_id,
        })
    }

    res.render("case/case_list", {
        layout: "dashboard",
        title: "View All Cases",
        all_cases: lawyerAsign.length > 0 ? lawyerAsign : "",
        file_assignment,
        lawyerDetails
    })

});

router.get("/legalcart-challan", auth, async (req, res) => {
    var add_case_close_status_lawyer = req.flash('add-status-close-case')[0];
    var existing_CT1_cases = req.flash('existing-CT1-cases')[0];
    var casedetails = {}
    var closeCasedetails = {};
    var closeLawyerCasedetails = {};

    if (req.user.role_id == 3) {
        casedetails.firm_id = req.user.firm_id
    } else if (req.user.role_id == 5) {
        casedetails.customer_id = req.user.id
    }
    if (req.user.role_id == 1) {
        casedetails.status = 3;
    }
    casedetails.case_no = '0';
    casedetails.case_type_id = 7;
    casedetails.closeing_status = "0";
    if (req.user.role_id == 3) {
        closeCasedetails.firm_id = req.user.firm_id
    } else if (req.user.role_id == 5) {
        closeCasedetails.customer_id = req.user.id
    }
    closeCasedetails.case_no = '0';
    closeCasedetails.case_type_id = 7;
    closeCasedetails.closeing_status = 1;

    if (req.user.role_id == 3) {
        closeLawyerCasedetails.firm_id = req.user.firm_id
    } else if (req.user.role_id == 5) {
        closeLawyerCasedetails.customer_id = req.user.id
    }
    if (req.user.role_id == 1) {
        closeLawyerCasedetails.status = 1;
    }
    closeLawyerCasedetails.case_no = '0';
    closeLawyerCasedetails.case_type_id = 7;
    closeLawyerCasedetails.closeing_status = "0";
    AllCase.hasMany(CabCaseDetail, {
        foreignKey: 'case_id'
    });
    AllCase.hasMany(lawyerAssignment, {
        foreignKey: 'case_id'
    });
    lawyerAssignment.belongsTo(User, {
        foreignKey: 'lawyer_id'
    });
    AllCase.hasMany(Fileuploads, {
        foreignKey: 'case_id'
    });
    AllCase.hasMany(Conversation, {
        foreignKey: 'case_id'
    });
    //var date = moment(date, 'MM-DD-YYYY')
    var createat_date = await AllCase.findAll({
        where: casedetails,
        attributes: [
            [Sequelize.literal(`create_case_date`), 'date'],
            [Sequelize.literal(`COUNT(*)`), 'count'],
        ],
        group: ['date'],
        order: [['create_case_date', 'DESC']],
    })
    var allCase = [];
    for(var c=0;c<createat_date.length;c++)
    {
        var whereCaseCondition = {};
        whereCaseCondition.case_no = '0';
        whereCaseCondition.case_type_id = 7;
        whereCaseCondition.closeing_status = "0";
        whereCaseCondition.create_case_date = createat_date[c].dataValues.date;
        if (req.user.role_id == 3) {
            whereCaseCondition.firm_id = req.user.firm_id
        } else if (req.user.role_id == 5) {
            whereCaseCondition.customer_id = req.user.id
        }
        else
        {
            whereCaseCondition.status = 3;
        }
        
        var all_cases = await AllCase.findAll({
            where: whereCaseCondition,
            order: [
                ['id', 'DESC']
            ],
            include: [{
                model: CabCaseDetail
            }, {
                model: lawyerAssignment,
                include: [{
                    model:User
                }]
            }, {
                model: Fileuploads
            }, {
                model: Conversation
            }],
            order: [
                ['id', 'DESC'],
                [Conversation, 'id', 'DESC']
            ]
        });
        var caseConvId = [];
        for (var q = 0; q < all_cases.length;q++)
        {
            caseConvId.push(all_cases[q].id)
        }
        var conv_len = await Conversation.findAll({
            where: {
                case_id: caseConvId,
                status: 0,
                user_id: {
                    [Op.ne]: req.user.id
                  }
            }
        })
        allCase.push({
            "date": createat_date[c].dataValues.date,
            "count": createat_date[c].dataValues.count,
            "all_case": all_cases,
            "conv_len": conv_len.length
        })
    }
    
    var close_createat_date = await AllCase.findAll({
        where: closeCasedetails,
        attributes: [
            [Sequelize.literal(`create_case_date`), 'date'],
            [Sequelize.literal(`COUNT(*)`), 'count'],
        ],
        group: ['date'],
        order: [['create_case_date', 'DESC']],
    })
    var allCloseCase = [];
    for (var w = 0; w < close_createat_date.length; w++) {
        var whereCloseCaseCondition = {};
        whereCloseCaseCondition.case_no = '0';
        whereCloseCaseCondition.case_type_id = 7;
        whereCloseCaseCondition.closeing_status = 1;
        whereCloseCaseCondition.create_case_date = close_createat_date[w].dataValues.date;
        if (req.user.role_id == 3) {
            whereCloseCaseCondition.firm_id = req.user.firm_id
        } else if (req.user.role_id == 5) {
            whereCloseCaseCondition.customer_id = req.user.id
        }
        // console.log(createat_date[c].whereCollection)
        var all_close_cases = await AllCase.findAll({
            where: whereCloseCaseCondition,
            include: [{
                model: CabCaseDetail
            }, {
                model: lawyerAssignment,
                include: [{
                    model:User
                }]
            }, {
                model: Fileuploads
            }, {
                model: Conversation
            }],
            order: [
                ['id', 'DESC'],
                [Conversation, 'id', 'DESC']
            ]
        });
        var caseConvIdClose = [];
        for (var z = 0; z < all_close_cases.length; z++) {
            caseConvIdClose.push(all_close_cases[z].id)
        }
        var close_conv_len = await Conversation.findAll({
            where: {
                case_id: caseConvIdClose,
                status: 0,
                user_id: {
                    [Op.ne]: req.user.id
                  }
            }
        })
        allCloseCase.push({
            "close_date": close_createat_date[w].dataValues.date,
            "close_count": close_createat_date[w].dataValues.count,
            "all_case_close": all_close_cases,
            "close_conv_len": close_conv_len.length
        })
    }


    var createat_date_lawyer_close = await AllCase.findAll({
        where: closeLawyerCasedetails,
        attributes: [
            [Sequelize.literal(`create_case_date`), 'date'],
            [Sequelize.literal(`COUNT(*)`), 'count'],
        ],
        group: ['date'],
        order: [['create_case_date', 'DESC']],
    })
    var allCaseLawyerComplete = [];
    for (var c = 0; c < createat_date_lawyer_close.length; c++) {
        var whereCaseConditionLawyerComplete = {};
        whereCaseConditionLawyerComplete.case_no = '0';
        whereCaseConditionLawyerComplete.case_type_id = 7;
        whereCaseConditionLawyerComplete.closeing_status = "0";
        whereCaseConditionLawyerComplete.create_case_date = createat_date_lawyer_close[c].dataValues.date;
        if (req.user.role_id == 3) {
            whereCaseConditionLawyerComplete.firm_id = req.user.firm_id
        } else if (req.user.role_id == 5) {
            whereCaseConditionLawyerComplete.customer_id = req.user.id
        } else {
            whereCaseConditionLawyerComplete.status = 1;
        }

        var all_casess = await AllCase.findAll({
            where: whereCaseConditionLawyerComplete,
            include: [{
                model: CabCaseDetail
            }, {
                model: lawyerAssignment,
                include: [{
                    model:User
                }]
            }, {
                model: Fileuploads
            }, {
                model: Conversation
            }],
            order: [
                ['id', 'DESC'],
                [Conversation, 'id', 'DESC']
            ]
        });
        var caseConvIdCloseBylawyer = [];
        for (var t = 0; t < all_casess.length; t++) {
            caseConvIdCloseBylawyer.push(all_casess[t].id)
        }
        var close_by_lawyer_conv_len = await Conversation.findAll({
            where: {
                case_id: caseConvIdCloseBylawyer,
                status: 0,
                user_id: {
                    [Op.ne]: req.user.id
                  }
            }
        })
        allCaseLawyerComplete.push({
            "date": createat_date_lawyer_close[c].dataValues.date,
            "count": createat_date_lawyer_close[c].dataValues.count,
            "all_case": all_casess,
            "close_by_lawyer_conv_len": close_by_lawyer_conv_len.length
        })
    }


    /**
     * For super admin
     */

     //Rejected
     var reject_case_details = {}
     if (req.user.role_id == 3) {
        reject_case_details.firm_id = req.user.firm_id
    } else if (req.user.role_id == 5) {
        reject_case_details.customer_id = req.user.id
    }
    reject_case_details.case_no = '0';
    reject_case_details.case_type_id = 7;
    reject_case_details.invitation = 2;
     var reject = await AllCase.findAll({
        where: reject_case_details,
        attributes: [
            [Sequelize.literal(`create_case_date`), 'date'],
            [Sequelize.literal(`COUNT(*)`), 'count'],
        ],
        group: ['date'],
        order: [['create_case_date', 'DESC']],
    })
    var reject_case = [];
    for (var w = 0; w < reject.length; w++) {
        var whereCloseCaseCondition = {};
        whereCloseCaseCondition.case_no = '0';
        whereCloseCaseCondition.case_type_id = 7;
        whereCloseCaseCondition.invitation = 2;
        whereCloseCaseCondition.create_case_date = reject[w].dataValues.date;
        if (req.user.role_id == 3) {
            whereCloseCaseCondition.firm_id = req.user.firm_id
        } else if (req.user.role_id == 5) {
            whereCloseCaseCondition.customer_id = req.user.id
        }
        // console.log(createat_date[c].whereCollection)
        var reject_cases = await AllCase.findAll({
            where: whereCloseCaseCondition,
            include: [{
                model: CabCaseDetail
            }, {
                model: lawyerAssignment,
                include: [{
                    model:User
                }]
            }, {
                model: Fileuploads
            }, {
                model: Conversation
            }],
            order: [
                ['id', 'DESC'],
                [Conversation, 'id', 'DESC']
            ]
        });
        var caseConvIdClose = [];
        for (var z = 0; z < reject_cases.length; z++) {
            caseConvIdClose.push(reject_cases[z].id)
        }
        var close_conv_len = await Conversation.findAll({
            where: {
                case_id: caseConvIdClose,
                status: 0
            }
        })

        reject_case.push({
            "close_date": reject[w].dataValues.date,
            "close_count": reject[w].dataValues.count,
            "reject_cases": reject_cases,
            "close_conv_len": close_conv_len.length
        })
    }

    const filesAll = await Fileuploads.findAll({
        where: {
            status: 0
        }
    });

    var file_assignment = req.flash('file-assign')[0];  
    var caseAdd = req.flash('add-CT1-cases')[0];
    const bulk_id = req.flash('bulk-id')[0];

    // var file_assignment = await Fileuploads.findAll({
    //     where: { status:'0' }
    // });

    const lawyerDetails = await UserDetails.findAll({
        where: {
            role_id: 2
        }
    });

    

    BulkCase.belongsTo(User, {
        foreignKey: 'user_id'
    });

    BulkCase.belongsTo(Firm, {
        foreignKey: 'firm_id'
    });
    var whereCondition = {};
    whereCondition.case_length= {
        [Op.ne]: '0'
    }
    whereCondition.case_type_id = 7;
    if(req.user.role_id == "3"){
        if(req.user.sub_role == "C")
        {
            whereCondition.firm_id = req.user.firm_id
        }
    }
    else if(req.user.role_id == "5")
    {
        whereCondition.user_id = req.user.id
    }
    const casesDetails = await BulkCase.findAll({
        where: whereCondition,
        order: [
            ['id', 'DESC']
        ],
        include: [{
            model: Firm
        },
        {
            model: User
        }]
    });
    var pending_challan_count_condition = {};
    pending_challan_count_condition.status =  req.user.role_id == "1" ? 3 : [0,3,1];
    pending_challan_count_condition.case_type_id =  7;
    if(req.user.role_id == "3"){
        pending_challan_count_condition.firm_id = req.user.firm_id;
        pending_challan_count_condition.closeing_status = 0
        
    }
    else if(req.user.role_id == "5")
    {
        pending_challan_count_condition.customer_id = req.user.id;
        pending_challan_count_condition.closeing_status = 0;
    }
    var pending_challan_count = await AllCase.findAll({
        where: pending_challan_count_condition
    }) 
    
    var complete_lawyer_challan_count = await AllCase.findAll({
        where: {
            status: 1,
            closeing_status: 0,
            case_type_id: 7
        }
    })
    // console.log(all_cases);
    res.render("case/challan_list", {
        layout: "dashboard",
        title: "View All Cases",
        allCase,
        allCloseCase,
        reject_case,
        allCaseLawyerComplete,
        file_assignment,
        lawyerDetails,
        customerDetails: casesDetails,
        filesAll,
        caseAdd: caseAdd?caseAdd:"",
        bulk_id: bulk_id? parseInt(bulk_id):"",
        add_case_close_status_lawyer,
        existing_CT1_cases,
        pending_challan_count: pending_challan_count.length > 0 ? `(${pending_challan_count.length})` : "",
        complete_lawyer_challan_count: complete_lawyer_challan_count.length > 0 ? `(${complete_lawyer_challan_count.length})` : "",
    })

});

router.get("/legalcart-superdari", auth, async (req, res) => {
    var add_case_close_status_lawyer = req.flash('add-status-close-case')[0];
    var existing_CT1_cases = req.flash('existing-CT1-cases')[0];

    var casedetails = {}
    var closeCasedetails = {};
    var closeLawyerCasedetails = {};

    if (req.user.role_id == 3) {
        casedetails.firm_id = req.user.firm_id
    } else if (req.user.role_id == 5) {
        casedetails.customer_id = req.user.id
    }
    if (req.user.role_id == 1) {
        casedetails.status = 3;
    }  
    casedetails.case_no = '0';
    casedetails.case_type_id = 6;
    casedetails.closeing_status = "0";
    if (req.user.role_id == 3) {
        closeCasedetails.firm_id = req.user.firm_id
    } else if (req.user.role_id == 5) {
        closeCasedetails.customer_id = req.user.id
    }
    closeCasedetails.case_no = '0';
    closeCasedetails.case_type_id = 6;
    closeCasedetails.closeing_status = 1;


    if (req.user.role_id == 3) {
        closeLawyerCasedetails.firm_id = req.user.firm_id
    } else if (req.user.role_id == 5) {
        closeLawyerCasedetails.customer_id = req.user.id
    }
    if (req.user.role_id == 1) {
        closeLawyerCasedetails.status = 1;
    }
    closeLawyerCasedetails.case_no = '0';
    closeLawyerCasedetails.case_type_id = 6;
    closeLawyerCasedetails.closeing_status = "0";
    AllCase.hasMany(CabCaseDetail, {
        foreignKey: 'case_id'
    });
    AllCase.hasMany(lawyerAssignment, {
        foreignKey: 'case_id'
    });
    AllCase.hasMany(Fileuploads, {
        foreignKey: 'case_id'
    });
    lawyerAssignment.belongsTo(User, {
        foreignKey: 'lawyer_id'
    });
    AllCase.hasMany(Conversation, {
        foreignKey: 'case_id'
    });
    //var date = moment(date, 'MM-DD-YYYY')
    var createat_date = await AllCase.findAll({
        where: casedetails,
        attributes: [
            [Sequelize.literal(`create_case_date`), 'date'],
            [Sequelize.literal(`COUNT(*)`), 'count'],
        ],
        group: ['date'],
        order: [['create_case_date', 'DESC']],
    })
    var allCase = [];
    for (var c = 0; c < createat_date.length; c++) {
        var whereCaseCondition = {};
        whereCaseCondition.case_no = '0';
        whereCaseCondition.case_type_id = 6;
        whereCaseCondition.closeing_status = "0";
        whereCaseCondition.create_case_date = createat_date[c].dataValues.date;
        if (req.user.role_id == 3) {
            whereCaseCondition.firm_id = req.user.firm_id
        } else if (req.user.role_id == 5) {
            whereCaseCondition.customer_id = req.user.id
        }
        if (req.user.role_id == 1) {
            whereCaseCondition.status = 3;
        }
        // console.log(createat_date[c].whereCollection)
        var all_cases = await AllCase.findAll({
            where: whereCaseCondition,
            order: [
                ['id', 'DESC']
            ],
            include: [{
                model: CabCaseDetail
            }, {
                model: lawyerAssignment,
                include: [{
                    model:User
                }]
            }, {
                model: Fileuploads
            }, {
                model: Conversation
            }],
            order: [
                ['id', 'DESC'],
                [Conversation, 'id', 'DESC']
            ]
        });
        var caseConvId = [];
        for (var q = 0; q < all_cases.length;q++)
        {
            caseConvId.push(all_cases[q].id)
        }
        var conv_len = await Conversation.findAll({
            where: {
                case_id: caseConvId,
                status: 0,
                user_id: {
                    [Op.ne]: req.user.id
                  }
            }
        })
        allCase.push({
            "date": createat_date[c].dataValues.date,
            "count": createat_date[c].dataValues.count,
            "all_case": all_cases,
            "conv_len": conv_len.length
        })
        // var all_cases = await AllCase.findAll({
        //     attributes:
        //         [Sequelize.where(Sequelize.fn('char_length', Sequelize.col('status')), 1),
        //     order: [
        //         ['id', 'DESC']
        //     ],
        //     include: [{
        //         model: CabCaseDetail
        //     }, {
        //         model: lawyerAssignment
        //     }, {
        //         model: Fileuploads
        //     }]
        // });
        // console.log(all_cases)
    }

    var close_createat_date = await AllCase.findAll({
        where: closeCasedetails,
        attributes: [
            [Sequelize.literal(`create_case_date`), 'date'],
            [Sequelize.literal(`COUNT(*)`), 'count'],
        ],
        group: ['date'],
        order: [['create_case_date', 'DESC']],
    })
    var allCloseCase = [];
    for (var w = 0; w < close_createat_date.length; w++) {
        var whereCloseCaseCondition = {};
        whereCloseCaseCondition.case_no = '0';
        whereCloseCaseCondition.case_type_id = 6;
        whereCloseCaseCondition.closeing_status = 1;
        whereCloseCaseCondition.create_case_date = close_createat_date[w].dataValues.date;
        if (req.user.role_id == 3) {
            whereCloseCaseCondition.firm_id = req.user.firm_id
        } else if (req.user.role_id == 5) {
            whereCloseCaseCondition.customer_id = req.user.id
        }
        // console.log(createat_date[c].whereCollection)
        var all_close_cases = await AllCase.findAll({
            where: whereCloseCaseCondition,
            order: [
                ['id', 'DESC']
            ],
            include: [{
                model: CabCaseDetail
            }, {
                model: lawyerAssignment,
                include: [{
                    model:User
                }]
            }, {
                model: Fileuploads
            }, {
                model: Conversation
            }],
            order: [
                ['id', 'DESC'],
                [Conversation, 'id', 'DESC']
            ]
        });
        var caseConvIdClose = [];
        for (var z = 0; z < all_close_cases.length; z++) {
            caseConvIdClose.push(all_close_cases[z].id)
        }
        var close_conv_len = await Conversation.findAll({
            where: {
                case_id: caseConvIdClose,
                status: 0,
                user_id: {
                    [Op.ne]: req.user.id
                  }
            }
        })
        allCloseCase.push({
            "close_date": close_createat_date[w].dataValues.date,
            "close_count": close_createat_date[w].dataValues.count,
            "all_case_close": all_close_cases,
            "close_conv_len": close_conv_len.length
        })
    }


    //Rejected -1-03-2019
    var reject_case_details = {}
    if (req.user.role_id == 3) {
       reject_case_details.firm_id = req.user.firm_id
   } else if (req.user.role_id == 5) {
       reject_case_details.customer_id = req.user.id
   }
   reject_case_details.case_no = '0';
   reject_case_details.case_type_id = 6;
   reject_case_details.invitation = 2;
    var reject = await AllCase.findAll({
       where: reject_case_details,
       attributes: [
           [Sequelize.literal(`create_case_date`), 'date'],
           [Sequelize.literal(`COUNT(*)`), 'count'],
       ],
       group: ['date'],
       order: [['create_case_date', 'DESC']],
   })
   var reject_case = [];
   for (var w = 0; w < reject.length; w++) {
       var whereCloseCaseCondition = {};
       whereCloseCaseCondition.case_no = '0';
       whereCloseCaseCondition.case_type_id = 6;
       whereCloseCaseCondition.invitation = 2;
       whereCloseCaseCondition.create_case_date = reject[w].dataValues.date;
       if (req.user.role_id == 3) {
           whereCloseCaseCondition.firm_id = req.user.firm_id
       } else if (req.user.role_id == 5) {
           whereCloseCaseCondition.customer_id = req.user.id
       }
       // console.log(createat_date[c].whereCollection)
       var reject_cases = await AllCase.findAll({
           where: whereCloseCaseCondition,
           include: [{
               model: CabCaseDetail
           }, {
               model: lawyerAssignment,
               include: [{
                   model:User
               }]
           }, {
               model: Fileuploads
           }, {
               model: Conversation
           }],
           order: [
               ['id', 'DESC'],
               [Conversation, 'id', 'DESC']
           ]
       });
       var caseConvIdClose = [];
       for (var z = 0; z < reject_cases.length; z++) {
           caseConvIdClose.push(reject_cases[z].id)
       }
       var close_conv_len = await Conversation.findAll({
           where: {
               case_id: caseConvIdClose,
               status: 0
           }
       })

       reject_case.push({
           "close_date": reject[w].dataValues.date,
           "close_count": reject[w].dataValues.count,
           "reject_cases": reject_cases,
           "close_conv_len": close_conv_len.length
       })
   }


    var createat_date_lawyer_close = await AllCase.findAll({
        where: closeLawyerCasedetails,
        attributes: [
            [Sequelize.literal(`create_case_date`), 'date'],
            [Sequelize.literal(`COUNT(*)`), 'count'],
        ],
        group: ['date'],
        order: [['create_case_date', 'DESC']],
    })
    var allCaseLawyerComplete = [];
    for (var c = 0; c < createat_date_lawyer_close.length; c++) {
        var whereCaseConditionLawyerComplete = {};
        whereCaseConditionLawyerComplete.case_no = '0';
        whereCaseConditionLawyerComplete.case_type_id = 6;
        whereCaseConditionLawyerComplete.closeing_status = "0";
        whereCaseConditionLawyerComplete.create_case_date = createat_date_lawyer_close[c].dataValues.date;
        if (req.user.role_id == 3) {
            whereCaseConditionLawyerComplete.firm_id = req.user.firm_id
        } else if (req.user.role_id == 5) {
            whereCaseConditionLawyerComplete.customer_id = req.user.id
        } else {
            whereCaseConditionLawyerComplete.status = 1;
        }

        var all_casess = await AllCase.findAll({
            where: whereCaseConditionLawyerComplete,
            order: [
                ['id', 'DESC']
            ],
            include: [{
                model: CabCaseDetail
            }, {
                model: lawyerAssignment,
                include: [{
                    model:User
                }]
            }, {
                model: Fileuploads
            }, {
                model: Conversation
            }],
            order: [
                ['id', 'DESC'],
                [Conversation, 'id', 'DESC']
            ]
        });
        var caseConvIdCloseBylawyer = [];
        for (var t = 0; t < all_casess.length; t++) {
            caseConvIdCloseBylawyer.push(all_casess[t].id)
        }
        var close_by_lawyer_conv_len = await Conversation.findAll({
            where: {
                case_id: caseConvIdCloseBylawyer,
                status: 0,
                user_id: {
                    [Op.ne]: req.user.id
                  }
            }
        })
        allCaseLawyerComplete.push({
            "date": createat_date_lawyer_close[c].dataValues.date,
            "count": createat_date_lawyer_close[c].dataValues.count,
            "all_case": all_casess,
            "close_by_lawyer_conv_len": close_by_lawyer_conv_len.length
        })
    }
    /**
     * For super admin
     */

    const filesAll = await Fileuploads.findAll({
        where: {
            status: 0
        }
    });

    var file_assignment = req.flash('file-assign')[0];  
    var caseAdd = req.flash('add-CT1-cases')[0];
    const bulk_id = req.flash('bulk-id')[0];

    // var file_assignment = await Fileuploads.findAll({
    //     where: { status:'0' }
    // });

    const lawyerDetails = await UserDetails.findAll({
        where: {
            role_id: 2
        }
    });

    // for (let i = 0; i < all_cases.length; i++) {
    //     var lawyerAssignmentDetails = await lawyerAssignment.findAll({
    //         where: {
    //             case_id: all_cases[i].id
    //         }
    //     });

    //     var fileuploadsAssign = await Fileuploads.findAll({
    //         where: {
    //             case_id: all_cases[i].id
    //         }
    //     });
    //     //console.log(all_cases[i].cab_case_details[0]);
    //     lawyerAsign.push({
    //         'id': all_cases[i].id,
    //         'cab_no': all_cases[i].cab_no,
    //         'case_type': all_cases[i].case_type,
    //         'assign': (lawyerAssignmentDetails.length > 0) ? 1 : 0,
    //         'assign_file': (fileuploadsAssign.length > 0) ? 1 : 0,
    //         'status': all_cases[i].status,
    //         'name_of_ps': all_cases[i].cab_case_details[0].name_of_ps ? all_cases[i].cab_case_details[0].name_of_ps : '',
    //         'impound_status': all_cases[i].cab_case_details[0].impound_status ? all_cases[i].cab_case_details[0].impound_status : '',
    //         'driver_name': all_cases[i].cab_case_details[0].driver_name ? all_cases[i].cab_case_details[0].driver_name : "",
    //         'driver_mobile': all_cases[i].cab_case_details[0].driver_mobile ? all_cases[i].cab_case_details[0].driver_name : "",
    //         'closeing_status': all_cases[i].closeing_status,
    //         'bulk_case_id': all_cases[i].bulk_case_id,
    //         'createdAt': all_cases[i].createdAt,
    //         'updatedAt': all_cases[i].updatedAt
    //     })
    // }

    BulkCase.belongsTo(User, {
        foreignKey: 'user_id'
    });

    BulkCase.belongsTo(Firm, {
        foreignKey: 'firm_id'
    });
    var whereCondition = {};
    whereCondition.case_length= {
        [Op.ne]: '0'
    }
    whereCondition.case_type_id = 6;
    if(req.user.role_id == "3"){
        if(req.user.sub_role == "C")
        {
            whereCondition.firm_id = req.user.firm_id
        }
    }
    else if(req.user.role_id == "5")
    {
        whereCondition.user_id = req.user.id
    }
    const casesDetails = await BulkCase.findAll({
        where: whereCondition,
        order: [
            ['id', 'DESC']
        ],
        include: [{
            model: Firm
        },
        {
            model: User
        }]
    });
    //console.log(allCase[0].all_case);
    var pending_superdari_count_condition = {};
    pending_superdari_count_condition.status =  req.user.role_id == "1" ? 3 : [0,3,1];
    pending_superdari_count_condition.case_type_id =  6;
    if(req.user.role_id == "3"){
        pending_superdari_count_condition.firm_id = req.user.firm_id;
        pending_superdari_count_condition.closeing_status = 0
        
    }
    else if(req.user.role_id == "5")
    {
        pending_superdari_count_condition.customer_id = req.user.id;
        pending_superdari_count_condition.closeing_status = 0;
    }
    
    var pending_superdari_count = await AllCase.findAll({
        where: pending_superdari_count_condition
    })
    var complete_lawyer_superdari_count = await AllCase.findAll({
        where: {
            status: 1,
            closeing_status: 0,
            case_type_id: 6
        }
    })
    res.render("case/superdari_list", {
        layout: "dashboard",
        title: "View All Superdari Cases",
        allCase,
        allCloseCase,
        allCaseLawyerComplete,
        file_assignment,
        lawyerDetails,
        customerDetails: casesDetails,
        filesAll,
        caseAdd: caseAdd?caseAdd:"",
        bulk_id: bulk_id? parseInt(bulk_id):"",
        add_case_close_status_lawyer,
        existing_CT1_cases, 
        pending_superdari_count: pending_superdari_count.length > 0 ? `(${pending_superdari_count.length})` : "",
        complete_lawyer_superdari_count: complete_lawyer_superdari_count.length > 0 ? `(${complete_lawyer_superdari_count.length})` : ""
    })

});

router.get("/challan/case/list/:id", auth, csrfProtection, async (req, res) => {
    var success_del_case_by_manager = req.flash('delete-case-by-manager')[0];
    const caseBulk_id = req.params['id'];
    //const decryptedString = cryptr.decrypt(req.params['id']);

    var bulk_case = await BulkCase.findOne({
        where: {
            id: caseBulk_id
        }
    });
    var rate_list = await RateList.findOne({
        where: {
            id: bulk_case.case_type_id
        }
    })
    var lawyer_assigned = req.flash('lawyer-assigned')[0];
    var lawyerAsign = [];
    var fileLists = [];

    //file fetch
   const fileList = await Fileuploads.findAll({
        where:{ bulk_id:caseBulk_id }
    });
    
    for (let files of fileList) {
        var replaceData = _.replace(files.name, new RegExp("/upload_Files/"), "");
        fileLists.push({
            "name":files.name,
            "id": files.id,
            'file_title':replaceData,
            'filename':files.filename
        })
    }

    //case fatch
    AllCase.hasMany(CabCaseDetail, {
        foreignKey: 'case_id'
    });
    AllCase.hasMany(lawyerAssignment, {
        foreignKey: 'case_id'
    });
    AllCase.hasMany(Fileuploads, {
        foreignKey: 'case_id'
    });
    AllCase.hasMany(MactCaseDetail, {
        foreignKey: 'case_id'
    });

    const all_cases = await AllCase.findAll({
        where: {
            bulk_case_id:caseBulk_id,
            status: '0'
         },
         order: [
            ['id', 'DESC']
        ],
        include: [{
            model: CabCaseDetail
        }, {
            model: lawyerAssignment
        }, {
            model: Fileuploads
        },{
            model: MactCaseDetail
        }]
    });

    // for (let i = 0; i < all_cases.length; i++) {
    //     var lawyerAssignmentDetails = await lawyerAssignment.findAll({
    //         where: {
    //             case_id: all_cases[i].id
    //         }
    //     });

    //     var fileuploadsAssign = await Fileuploads.findAll({
    //         where: {
    //             case_id: all_cases[i].id
    //         }
    //     });

    //     // lawyerAsign.push({
    //     //     'id': all_cases[i].id,
    //     //     'cab_no': all_cases[i].cab_no,
    //     //     'case_type': all_cases[i].case_type,
    //     //     'assign': (lawyerAssignmentDetails.length > 0) ? 1 : 0,
    //     //     'assign_file': (fileuploadsAssign.length > 0) ? 1 : 0,
    //     //     'status': all_cases[i].status,
    //     //     'name_of_ps': all_cases[i].cab_case_details[0].name_of_ps,
    //     //     'impound_status': all_cases[i].cab_case_details[0].impound_status,
    //     //     'driver_name': all_cases[i].cab_case_details[0].driver_name,
    //     //     'driver_mobile': all_cases[i].cab_case_details[0].driver_mobile,
    //     //     'closeing_status': all_cases[i].closeing_status,
    //     //     'bulk_case_id': all_cases[i].bulk_case_id,
    //     // })
    // }
    //console.log(all_cases[0].lawyer_assignments.length);
    const filesAll = await Fileuploads.findAll({
        where: {
            bulk_id: caseBulk_id,
            status: 0
        }
    });

    let isArrarData = []
    for (let data of filesAll) {
       var replaceData =  _.replace(data.name,new RegExp("/upload_Files/"),"");
       isArrarData.push({
           "name":replaceData,
           "id": data.id
       })
       
    }


    const lawyerDetails = await UserDetails.findAll({
        where: {
            role_id: 2
        }
    });


    
    res.render("case/challan_case_list_by_id", {
        layout: "dashboard",
        title: "Add Case",
        csrfToken: req.csrfToken(),
        rate_list,
        casesDetails: all_cases,
        lawyerDetails,
        filesAll:isArrarData,
        lawyer_assigned: lawyer_assigned? lawyer_assigned:"",
        fileList:fileLists? fileLists:" ",
        bulk_case_id: caseBulk_id ,
        success_del_case_by_manager
    })
});



router.get("/legalcart-challan/add/:id", auth, CorporateCustomerAuth, csrfProtection, async (req, res) => {
    const rateList = await RateList.findOne({
        where: {
            id: req.params['id']
        }
    });
    const court = await Court.findAll({
        order: [
            ['name', 'ASC'],
        ],
    });
    res.render("case/all_challan_add", {
        layout: "dashboard",
        title: "Add Case",
        csrfToken: req.csrfToken(),
        court,
        rateList
    })
});

router.get("/assign-case-all",auth, async(req, res) => {
    var assign_case = await lawyerAssignment.findAll({
        where: {
            lawyer_id: req.user.id
        }
    });
    all_case_id = [];
    for (var i = 0; i < assign_case.length; i++) {
        all_case_id.push(assign_case[i].case_id)
    }
    AllCase.belongsTo(RateList, {
        foreignKey: 'case_type_id'
    });
    AllCase.belongsTo(User, {
        foreignKey: 'customer_id'
    });
    var all_case = await AllCase.findAll({
        where: {
            id: all_case_id,
            cab_no: "0",
            case_type_id: {
                [Op.ne]: 7
            }
        },
        include: [{
            model:User
        },{
            model: RateList
        }]
    });
    res.render("case/lawyer_all_case",{
        layout: "dashboard",
        title: "All Case Lists",
        all_case
    });
});

router.get("/assign-challan-all",auth, async(req, res) => {
    
    var add_case_status_lawyer = req.flash('add-status-case')[0];
    var assign_case = await lawyerAssignment.findAll({
        where: {
            lawyer_id: req.user.id,
            invitation_status: 0
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
    AllCase.hasMany(Conversation, {
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
        }, {
            model: Conversation
        }],
        order: [
            ['updatedAt', 'DESC'],
            [Conversation, 'id', 'DESC']
        ]
    });
    var rateChart = await RateList.findOne({
        where: {
            id: 7
        }
    });
    var lawyer_rate = await Rate.findOne({
        where: {
            name: rateChart.type_of_case
        },
        order: [
            ['id', 'DESC']
        ]
    });
    res.render("case/lawyer_all_challan",{
        layout: "dashboard",
        title: "All Challan Case Lists",
        all_case,
        add_case_status_lawyer,
        lawyer_rate: lawyer_rate.rate_lawyers
    });
});

router.get("/assign-superdari-all", auth, async (req, res) => {
    
    var add_case_status_lawyer = req.flash('add-status-case')[0];
    var assign_case = await lawyerAssignment.findAll({
        where: {
            lawyer_id: req.user.id,
            invitation_status: 0
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
    AllCase.hasMany(Conversation, {
        foreignKey: 'case_id'
    });
    var all_case = await AllCase.findAll({
        where: {
            id: all_case_id,
            case_type_id: 6,
            case_no:"0"
        },
        include: [{
            model: CabCaseDetail
        }, {
            model: Conversation
        }],
        order: [
            ['updatedAt', 'DESC'],
            [Conversation, 'id', 'DESC']
        ]
    });
    var rateChart = await RateList.findOne({
        where: {
            id: 6
        }
    });
    var lawyer_rate = await Rate.findOne({
        where: {
            name: rateChart.type_of_case
        },
        order: [
            ['id', 'DESC']
        ]
    });
    res.render("case/lawyer_all_superdari",{
        layout: "dashboard",
        title: "All Superdari Case Lists",
        all_case,
        add_case_status_lawyer,
        lawyer_rate: lawyer_rate.rate_lawyers
    });
});

router.get("/create-zip-for-Files/:id", auth, async (req, res) => {
    var filesDeta = []

    const fileList = await Fileuploads.findAll({
        where:{ bulk_id:req.params['id'] }
    });

    fileList.forEach(element => {
        var replaceData = _.replace(element.name, new RegExp("/upload_Files/"), "");
        filesDeta.push({ path: path.join(__dirname, `/../public/upload_Files/${element.filename}`), name: replaceData })
    });

    res.zip({
        files:filesDeta,
        filename: 'nodejs-zip-files.zip'
    });

});

router.post("/add-case-status-by-lawyer", auth, async(req, res)=> {
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
            case_status_category_id: req.body.status_category,
            remarks: req.body.status_remarks,
            status: 0,
            user_id: req.user.id
        });
    }
    else
    {
        await AllCaseStatus.update({
            case_status_id: req.body.status,
            case_status_category_id: req.body.status_category,
            remarks: req.body.status_remarks,
            status: 0,
            user_id: req.user.id
        },{
            where:
            {
                case_id: req.body.case_id
            }
        });
    }

    await Conversation.create({
        case_id: req.body.case_id,
        user_id: req.user.id,
        c_msg: "<p>Case Stage change to <b>" + req.body.status_category_name + "</b> & Status Change to <b>" + req.body.status_name + "</b>. </p><br><p>Remarks- " + req.body.status_remarks+"</p>",
        remarks: "text",
        status: 0,
        c_image: "null"
    })
    res.json({
        success: true
    })
});

// STARTS MACT CASE SECTION BRATIN MEHETA

router.get("/legalcart-mact", auth, async (req, res) => {
    var add_case_close_status_lawyer = req.flash('add-status-close-case')[0];
    var existing_CT1_cases = req.flash('existing-CT1-cases')[0];
    var casedetails = {}
    var closeCasedetails = {};
    var closeLawyerCasedetails = {};

    if (req.user.role_id == 3) {
        casedetails.firm_id = req.user.firm_id
    } else if (req.user.role_id == 5) {
        casedetails.customer_id = req.user.id
    }
    if (req.user.role_id == 1) {
        casedetails.status = 3;
    }
    casedetails.case_no = '0';
    casedetails.case_type_id = 2;
    casedetails.closeing_status = "0";
    if (req.user.role_id == 3) {
        closeCasedetails.firm_id = req.user.firm_id
    } else if (req.user.role_id == 5) {
        closeCasedetails.customer_id = req.user.id
    }
    closeCasedetails.case_no = '0';
    closeCasedetails.case_type_id = 2;
    closeCasedetails.closeing_status = 1;

    if (req.user.role_id == 3) {
        closeLawyerCasedetails.firm_id = req.user.firm_id
    } else if (req.user.role_id == 5) {
        closeLawyerCasedetails.customer_id = req.user.id
    }
    if (req.user.role_id == 1) {
        closeLawyerCasedetails.status = 1;
    }
    closeLawyerCasedetails.case_no = '0';
    closeLawyerCasedetails.case_type_id = 2;
    closeLawyerCasedetails.closeing_status = "0";
    AllCase.hasMany(MactCaseDetail, {
        foreignKey: 'case_id'
    });
    AllCase.hasMany(lawyerAssignment, {
        foreignKey: 'case_id'
    });
    AllCase.hasMany(Fileuploads, {
        foreignKey: 'case_id'
    });
    lawyerAssignment.belongsTo(User, {
        foreignKey: 'lawyer_id'
    });
    AllCase.hasMany(Conversation, {
        foreignKey: 'case_id'
    });
    //var date = moment(date, 'MM-DD-YYYY')
    var createat_date = await AllCase.findAll({
        where: casedetails,
        attributes: [
            [Sequelize.literal(`create_case_date`), 'date'],
            [Sequelize.literal(`COUNT(*)`), 'count'],
        ],
        group: ['date'],
        order: [['create_case_date', 'DESC']],
    })
    var allCase = [];
    for (var c = 0; c < createat_date.length; c++) {
        var whereCaseCondition = {};
        whereCaseCondition.case_no = '0';
        whereCaseCondition.case_type_id = 2;
        whereCaseCondition.closeing_status = "0";
        whereCaseCondition.create_case_date = createat_date[c].dataValues.date;
        if (req.user.role_id == 3) {
            whereCaseCondition.firm_id = req.user.firm_id
        } else if (req.user.role_id == 5) {
            whereCaseCondition.customer_id = req.user.id
        } else {
            whereCaseCondition.status = 3;
        }

        var all_cases = await AllCase.findAll({
            where: whereCaseCondition,
            order: [
                ['id', 'DESC']
            ],
            include: [{
                model: MactCaseDetail
            }, {
                model: lawyerAssignment,
                include: [{
                    model:User
                }]
            }, {
                model: Fileuploads
            }, {
                model: Conversation
            }],
            order: [
                ['id', 'DESC'],
                [Conversation, 'id', 'DESC']
            ]
        });
        var caseConvId = [];
        for (var q = 0; q < all_cases.length;q++)
        {
            caseConvId.push(all_cases[q].id)
        }
        var conv_len = await Conversation.findAll({
            where: {
                case_id: caseConvId,
                status: 0,
                user_id: {
                    [Op.ne]: req.user.id
                  }
            }
        })
        allCase.push({
            "date": createat_date[c].dataValues.date,
            "count": createat_date[c].dataValues.count,
            "all_case": all_cases,
            "conv_len": conv_len.length
        })
        // var all_cases = await AllCase.findAll({
        //     attributes:
        //         [Sequelize.where(Sequelize.fn('char_length', Sequelize.col('status')), 1),
        //     order: [
        //         ['id', 'DESC']
        //     ],
        //     include: [{
        //         model: CabCaseDetail
        //     }, {
        //         model: lawyerAssignment
        //     }, {
        //         model: Fileuploads
        //     }]
        // });
        // console.log(all_cases)
    }

    var close_createat_date = await AllCase.findAll({
        where: closeCasedetails,
        attributes: [
            [Sequelize.literal(`create_case_date`), 'date'],
            [Sequelize.literal(`COUNT(*)`), 'count'],
        ],
        group: ['date'],
        order: [['create_case_date', 'DESC']],
    })
    var allCloseCase = [];
    for (var w = 0; w < close_createat_date.length; w++) {
        var whereCloseCaseCondition = {};
        whereCloseCaseCondition.case_no = '0';
        whereCloseCaseCondition.case_type_id = 2;
        whereCloseCaseCondition.closeing_status = 1;
        whereCloseCaseCondition.create_case_date = close_createat_date[w].dataValues.date;
        if (req.user.role_id == 3) {
            whereCloseCaseCondition.firm_id = req.user.firm_id
        } else if (req.user.role_id == 5) {
            whereCloseCaseCondition.customer_id = req.user.id
        }
        // console.log(createat_date[c].whereCollection)
        var all_close_cases = await AllCase.findAll({
            where: whereCloseCaseCondition,
            order: [
                ['id', 'DESC']
            ],
            include: [{
                model: MactCaseDetail
            }, {
                model: lawyerAssignment,
                include: [{
                    model:User
                }]
            }, {
                model: Fileuploads
            }, {
                model: Conversation
            }],
            order: [
                ['id', 'DESC'],
                [Conversation, 'id', 'DESC']
            ]
        });
        var caseConvIdClose = [];
        for (var z = 0; z < all_close_cases.length; z++) {
            caseConvIdClose.push(all_close_cases[z].id)
        }
        var close_conv_len = await Conversation.findAll({
            where: {
                case_id: caseConvIdClose,
                status: 0,
                user_id: {
                    [Op.ne]: req.user.id
                  }
            }
        })
        allCloseCase.push({
            "close_date": close_createat_date[w].dataValues.date,
            "close_count": close_createat_date[w].dataValues.count,
            "all_case_close": all_close_cases,
            "close_conv_len": close_conv_len.length
        })
    }


    var createat_date_lawyer_close = await AllCase.findAll({
        where: closeLawyerCasedetails,
        attributes: [
            [Sequelize.literal(`create_case_date`), 'date'],
            [Sequelize.literal(`COUNT(*)`), 'count'],
        ],
        group: ['date'],
        order: [['create_case_date', 'DESC']],
    })
    var allCaseLawyerComplete = [];
    for (var c = 0; c < createat_date_lawyer_close.length; c++) {
        var whereCaseConditionLawyerComplete = {};
        whereCaseConditionLawyerComplete.case_no = '0';
        whereCaseConditionLawyerComplete.case_type_id = 2;
        whereCaseConditionLawyerComplete.closeing_status = "0";
        whereCaseConditionLawyerComplete.create_case_date = createat_date_lawyer_close[c].dataValues.date;
        if (req.user.role_id == 3) {
            whereCaseConditionLawyerComplete.firm_id = req.user.firm_id
        } else if (req.user.role_id == 5) {
            whereCaseConditionLawyerComplete.customer_id = req.user.id
        } else {
            whereCaseConditionLawyerComplete.status = 1;
        }

        var all_casess = await AllCase.findAll({
            where: whereCaseConditionLawyerComplete,
            order: [
                ['id', 'DESC']
            ],
            include: [{
                model: MactCaseDetail
            }, {
                model: lawyerAssignment,
                include: [{
                    model:User
                }]
            }, {
                model: Fileuploads
            }, {
                model: Conversation
            }],
            order: [
                ['id', 'DESC'],
                [Conversation, 'id', 'DESC']
            ]
        });
        var caseConvIdCloseBylawyer = [];
        for (var t = 0; t < all_casess.length; t++) {
            caseConvIdCloseBylawyer.push(all_casess[t].id)
        }
        var close_by_lawyer_conv_len = await Conversation.findAll({
            where: {
                case_id: caseConvIdCloseBylawyer,
                status: 0
            }
        })
        allCaseLawyerComplete.push({
            "date": createat_date_lawyer_close[c].dataValues.date,
            "count": createat_date_lawyer_close[c].dataValues.count,
            "all_case": all_casess,
            "close_by_lawyer_conv_len": close_by_lawyer_conv_len.length
        })
    }


    //Rejected -1-03-2019
    var reject_case_details = {}
    if (req.user.role_id == 3) {
       reject_case_details.firm_id = req.user.firm_id
   } else if (req.user.role_id == 5) {
       reject_case_details.customer_id = req.user.id
   }
   reject_case_details.case_no = '0';
   reject_case_details.case_type_id = 6;
   reject_case_details.invitation = 2;
    var reject = await AllCase.findAll({
       where: reject_case_details,
       attributes: [
           [Sequelize.literal(`create_case_date`), 'date'],
           [Sequelize.literal(`COUNT(*)`), 'count'],
       ],
       group: ['date'],
       order: [['create_case_date', 'DESC']],
   })
   var reject_case = [];
   for (var w = 0; w < reject.length; w++) {
       var whereCloseCaseCondition = {};
       whereCloseCaseCondition.case_no = '0';
       whereCloseCaseCondition.case_type_id = 6;
       whereCloseCaseCondition.invitation = 2;
       whereCloseCaseCondition.create_case_date = reject[w].dataValues.date;
       if (req.user.role_id == 3) {
           whereCloseCaseCondition.firm_id = req.user.firm_id
       } else if (req.user.role_id == 5) {
           whereCloseCaseCondition.customer_id = req.user.id
       }
       // console.log(createat_date[c].whereCollection)
       var reject_cases = await AllCase.findAll({
           where: whereCloseCaseCondition,
           include: [{
               model: CabCaseDetail
           }, {
               model: lawyerAssignment,
               include: [{
                   model:User
               }]
           }, {
               model: Fileuploads
           }, {
               model: Conversation
           }],
           order: [
               ['id', 'DESC'],
               [Conversation, 'id', 'DESC']
           ]
       });
       var caseConvIdClose = [];
       for (var z = 0; z < reject_cases.length; z++) {
           caseConvIdClose.push(reject_cases[z].id)
       }
       var close_conv_len = await Conversation.findAll({
           where: {
               case_id: caseConvIdClose,
               status: 0
           }
       })

       reject_case.push({
           "close_date": reject[w].dataValues.date,
           "close_count": reject[w].dataValues.count,
           "reject_cases": reject_cases,
           "close_conv_len": close_conv_len.length
       })
   }


    var createat_date_lawyer_close = await AllCase.findAll({
        where: closeLawyerCasedetails,
        attributes: [
            [Sequelize.literal(`create_case_date`), 'date'],
            [Sequelize.literal(`COUNT(*)`), 'count'],
        ],
        group: ['date'],
        order: [['create_case_date', 'DESC']],
    })
    var allCaseLawyerComplete = [];
    for (var c = 0; c < createat_date_lawyer_close.length; c++) {
        var whereCaseConditionLawyerComplete = {};
        whereCaseConditionLawyerComplete.case_no = '0';
        whereCaseConditionLawyerComplete.case_type_id = 2;
        whereCaseConditionLawyerComplete.closeing_status = "0";
        whereCaseConditionLawyerComplete.create_case_date = createat_date_lawyer_close[c].dataValues.date;
        if (req.user.role_id == 3) {
            whereCaseConditionLawyerComplete.firm_id = req.user.firm_id
        } else if (req.user.role_id == 5) {
            whereCaseConditionLawyerComplete.customer_id = req.user.id
        } else {
            whereCaseConditionLawyerComplete.status = 1;
        }

        var all_casess = await AllCase.findAll({
            where: whereCaseConditionLawyerComplete,
            order: [
                ['id', 'DESC']
            ],
            include: [{
                model: CabCaseDetail
            }, {
                model: lawyerAssignment,
                include: [{
                    model:User
                }]
            }, {
                model: Fileuploads
            }, {
                model: Conversation
            }],
            order: [
                ['id', 'DESC'],
                [Conversation, 'id', 'DESC']
            ]
        });
        var caseConvIdCloseBylawyer = [];
        for (var t = 0; t < all_casess.length; t++) {
            caseConvIdCloseBylawyer.push(all_casess[t].id)
        }
        var close_by_lawyer_conv_len = await Conversation.findAll({
            where: {
                case_id: caseConvIdCloseBylawyer,
                status: 0
            }
        })
        allCaseLawyerComplete.push({
            "date": createat_date_lawyer_close[c].dataValues.date,
            "count": createat_date_lawyer_close[c].dataValues.count,
            "all_case": all_casess,
            "close_by_lawyer_conv_len": close_by_lawyer_conv_len.length
        })
    }

    /**
     * For super admin
     */

    const filesAll = await Fileuploads.findAll({
        where: {
            status: 0
        }
    });

    var file_assignment = req.flash('file-assign')[0];
    var caseAdd = req.flash('add-CT1-cases')[0];
    const bulk_id = req.flash('bulk-id')[0];

    // var file_assignment = await Fileuploads.findAll({
    //     where: { status:'0' }
    // });

    const lawyerDetails = await UserDetails.findAll({
        where: {
            role_id: 2
        }
    });

    // for (let i = 0; i < all_cases.length; i++) {
    //     var lawyerAssignmentDetails = await lawyerAssignment.findAll({
    //         where: {
    //             case_id: all_cases[i].id
    //         }
    //     });

    //     var fileuploadsAssign = await Fileuploads.findAll({
    //         where: {
    //             case_id: all_cases[i].id
    //         }
    //     });
    //     //console.log(all_cases[i].cab_case_details[0]);
    //     // lawyerAsign.push({
    //     //     'id': all_cases[i].id,
    //     //     'cab_no': all_cases[i].cab_no,
    //     //     'case_type': all_cases[i].case_type,
    //     //     'assign': (lawyerAssignmentDetails.length > 0) ? 1 : 0,
    //     //     'assign_file': (fileuploadsAssign.length > 0) ? 1 : 0,
    //     //     'status': all_cases[i].status,
    //     //     //'name_of_ps': all_cases[i].cab_case_details[0].name_of_ps ? all_cases[i].cab_case_details[0].name_of_ps : '',
    //     //     'impound_status': all_cases[i].cab_case_details[0].impound_status ? all_cases[i].cab_case_details[0].impound_status : '',
    //     //     'driver_name': all_cases[i].cab_case_details[0].driver_name ? all_cases[i].cab_case_details[0].driver_name : "",
    //     //     'driver_mobile': all_cases[i].cab_case_details[0].driver_mobile ? all_cases[i].cab_case_details[0].driver_name : "",
    //     //     'closeing_status': all_cases[i].closeing_status,
    //     //     'bulk_case_id': all_cases[i].bulk_case_id,
    //     //     'createdAt': all_cases[i].createdAt,
    //     //     'updatedAt': all_cases[i].updatedAt
    //     // })
    // }

    BulkCase.belongsTo(User, {
        foreignKey: 'user_id'
    });

    BulkCase.belongsTo(Firm, {
        foreignKey: 'firm_id'
    });
    var whereCondition = {};
    whereCondition.case_length = {
        [Op.ne]: '0'
    }
    whereCondition.case_type_id = 2;
    if (req.user.role_id == "3") {
        if (req.user.sub_role == "C") {
            whereCondition.firm_id = req.user.firm_id
        }
    } else if (req.user.role_id == "5") {
        whereCondition.user_id = req.user.id
    }
    const casesDetails = await BulkCase.findAll({
        where: whereCondition,
        order: [
            ['id', 'DESC']
        ],
        include: [{
                model: Firm
            },
            {
                model: User
            }
        ]
    });
    var pending_mact_count_condition = {};
    pending_mact_count_condition.status =  req.user.role_id == "1" ? 3 : [0,3,1];
    pending_mact_count_condition.case_type_id =  2;
    if(req.user.role_id == "3"){
        pending_mact_count_condition.firm_id = req.user.firm_id;
        pending_mact_count_condition.closeing_status = 0
        
    }
    else if(req.user.role_id == "5")
    {
        pending_mact_count_condition.customer_id = req.user.id;
        pending_mact_count_condition.closeing_status = 0;
    }
    
    var pending_mact_count = await AllCase.findAll({
        where: pending_mact_count_condition
    })
    var complete_lawyer_mact_count = await AllCase.findAll({
        where: {
            status: 1,
            closeing_status: 0,
            case_type_id: 2
        }
    })
    res.render("case/mact_case/index", {
        layout: "dashboard",
        title: "View All MACT Cases",
        allCase,
        allCloseCase,
        rejectedCase:reject_case,
        allCaseLawyerComplete,
        file_assignment,
        lawyerDetails,
        customerDetails: casesDetails,
        filesAll,
        caseAdd: caseAdd ? caseAdd : "",
        bulk_id: bulk_id ? parseInt(bulk_id) : "",
        add_case_close_status_lawyer,
        existing_CT1_cases,
        pending_mact_count: pending_mact_count.length > 0 ? `(${pending_mact_count.length})` : "",
        complete_lawyer_mact_count: complete_lawyer_mact_count.length > 0 ? `(${complete_lawyer_mact_count.length})` : ""
    })

});

router.post("/upload-mact-case-excel", auth, uploadCases.array('file_name_type_1'), async (req, res) => {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd;
    }

    if (mm < 10) {
        mm = '0' + mm;
    }

    today = dd + '/' + mm + '/' + yyyy;
    var upload_case = xlsx.parse(fs.readFileSync('public/upload_cases/' + fileName));
    var importedData = JSON.stringify(convertToJSON(upload_case[0].data));
    var excelCases = JSON.parse(importedData);
    var bulkCaseCreate = await BulkCase.create({
        user_id: req.user.id,
        firm_id: req.user.firm_id,
        case_length: excelCases.length,
        status: '0',
        excel_file_name: '/upload_cases/' + fileName,
        case_type_id: req.body.case_type_id
    });
    var current_length = [];
    for (var i = 0; i < excelCases.length; i++) {
        if (excelCases[i].cab_no) {
            var duplicate_case = await AllCase.findAll({
                where: {
                    cab_no: excelCases[i].cab_no,
                    case_type_id: req.body.case_type_id,
                    createdAt: {
                        $gte: moment().subtract(7, 'days').toDate()
                    }
                }
            });
            if (duplicate_case.length == "0") {
                current_length.push(i);

                var court = await Court.findOne({
                    where: {
                        name: excelCases[i].court_name
                    }
                });
                var court_id;
                if (court == null) {
                    var add_new_court = await Court.create({
                        name: excelCases[i].court_name,
                    });
                    court_id = add_new_court.id
                } else {
                    court_id = court.id;
                }
                const date_of_hearing = excelCases[i].next_date_of_hearing ? excelCases[i].next_date_of_hearing.split("/") : '';
                var case_add = await AllCase.create({
                    case_no: 0,
                    cab_no: excelCases[i].cab_no,
                    customer_id: req.user.id,
                    case_type: 'CT1',
                    status: 0,
                    firm_id: req.user.firm_id,
                    city_id: req.user.city_id,
                    state_id: req.user.state_id,
                    case_type_id: req.body.case_type_id,
                    bulk_case_id: bulkCaseCreate.id,
                    create_case_date:today
                });
                var case_other_add = await MactCaseDetail.create({
                    case_id: case_add.id,
                    case_no: excelCases[i].case_no,
                    name_of_ps: excelCases[i].name_of_ps,
                    judge_name: excelCases[i].judge_name,
                    court_id: court_id,
                    stage_of_hearing: excelCases[i].stage_of_hearing,
                    claim_amount: excelCases[i].claim_amount,
                    next_date_of_hearing: date_of_hearing ? date_of_hearing[2] + "-" + date_of_hearing[1] + "-" + date_of_hearing[0] : null,
                    advocate: excelCases[i].advocate ? excelCases[i].advocate : LEGAL_KART,
                    status:0
                });
                await AllCaseStatus.create({
                    case_id: case_add.id,
                    case_status_id: 0,
                    case_status_category_id: 1,
                    status: 0,
                    user_id: 0,
                    customer_id: req.user.id,
                    firm_id: req.user.firm_id
                });
            }
        }
    }
    if (current_length.length == "0") {
        await BulkCase.destroy({
            where: {
                id: bulkCaseCreate.id
            }
        });
        req.flash('existing-CT1-cases', 'All Cases had been uploaded in between last 7 days');
        res.redirect('/legalcart-mact');
    } else {
        await BulkCase.update({
            case_length: current_length.length
        }, {
            where: {
                id: bulkCaseCreate.id
            }
        });
        await Notifications.create({
            remarks: `${current_length.length} MACT Cases has been Added.`,
            receive_id: 1,
            status: 1,
            sender_id: req.user.id,
            img: req.user.avatar,
            name: req.user.first_name + " " + req.user.last_name,
            link: "/legalcart-mact"
        });
        req.flash('bulk-id', `${bulkCaseCreate.id}`)
        req.flash('add-CT1-cases', 'Case Added Successfully');
        res.redirect('/legalcart-mact');
    }

});

router.post("/mact-case/add", auth, CorporateCustomerAuth, upload.array('file_name_type_2_manual'), csrfProtection, async (req, res) => {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd;
    }

    if (mm < 10) {
        mm = '0' + mm;
    }

    today = dd + '/' + mm + '/' + yyyy;
    var addAllCases = [];
    var cab_no = req.body.cab_no;
    var case_no = req.body.case_no;
    var name_of_ps = req.body.name_of_ps;
    var judge_name = req.body.judge_name;
    var court_id = req.body.court;
    var stage_of_hearing = req.body.stage_of_hearing;
    var claim_amount = req.body.claim_amount;
    var next_date_of_hearing = req.body.next_date_of_hearing;
    var advocate = req.body.advocate;

    var users = await UserDetails.findOne({
        where: {
            id: req.user.id
        }
    })

    for (var d = 0; d < cab_no.length; d++) {
        if (cab_no[d] !== "") {
            var c_no = cab_no[d];
            var doa = case_no[d];
            var ps = name_of_ps[d];
            var crt = judge_name[d];
            var dname = court_id[d];
            var dmob = stage_of_hearing[d];
            var adv = claim_amount[d];
            var uuu = next_date_of_hearing[d];
            var yyy = advocate[d];
            addAllCases.push({
                "cab_no": c_no,
                "case_no": doa,
                "name_of_ps": ps,
                "judge_name": crt,
                "court_id": dname,
                "stage_of_hearing": dmob,
                "claim_amount": adv,
                "next_date_of_hearing": uuu,
                "advocate": yyy
            });
        }
    }
    if(addAllCases.length == 0)
    {
            req.flash('existing-CT1-cases', 'Cab No can not be blank');
            res.redirect('/legalcart-mact');
    }
    else
    {
        var bulkCaseCreate = await BulkCase.create({
            user_id: req.user.id,
            firm_id: req.user.firm_id,
            case_length: addAllCases.length,
            status: '0',
            case_type_id: req.body.case_type_id
        });
        var current_length = [];
        for (var i = 0; i < addAllCases.length; i++) {
            var duplicate_case = await AllCase.findAll({
                where: {
                    cab_no: addAllCases[i].cab_no,
                    case_type_id: req.body.case_type_id,
                    createdAt: {
                        $gte: moment().subtract(7, 'days').toDate()
                    }
                }
            });
            if (duplicate_case.length == "0") {
                current_length.push(i);
                const date_of_hearing = addAllCases[i].next_date_of_hearing ? addAllCases[i].next_date_of_hearing.split("/") : '';
                var case_add = await AllCase.create({
                    case_no: 0,
                    cab_no: addAllCases[i].cab_no,
                    customer_id: req.user.id,
                    case_type: 'CT1',
                    status: 0,
                    firm_id: req.user.firm_id,
                    case_type_id: req.body.case_type_id,
                    city_id: users.city_id,
                    state_id: users.state_id,
                    bulk_case_id: bulkCaseCreate.id,
                    create_case_date: today
                });
                var case_other_add = await MactCaseDetail.create({
                    case_id: case_add.id,
                    case_no: addAllCases[i].case_no,
                    name_of_ps: addAllCases[i].name_of_ps,
                    judge_name: addAllCases[i].judge_name,
                    court_id: addAllCases[i].court_id,
                    stage_of_hearing: addAllCases[i].stage_of_hearing,
                    claim_amount: addAllCases[i].claim_amount,
                    next_date_of_hearing: date_of_hearing ? date_of_hearing[2] + "-" + date_of_hearing[1] + "-" + date_of_hearing[0] : null,
                    advocate: addAllCases[i].advocate ? addAllCases[i].advocate : LEGAL_KART,
                    status: 0
                });
                await AllCaseStatus.create({
                    case_id: case_add.id,
                    case_status_id: 0,
                    case_status_category_id: 1,
                    status: 0,
                    user_id: 0,
                    customer_id: req.user.id,
                    firm_id: req.user.firm_id
                });
            }
        }
        if (current_length.length == "0") {
            await BulkCase.destroy({
                where: {
                    id: bulkCaseCreate.id
                }
            });
            req.flash('existing-CT1-cases', 'All Cases had been uploaded in between last 7 days');
            res.redirect('/legalcart-mact');
        } else {
            await BulkCase.update({
                case_length: current_length.length
            }, {
                where: {
                    id: bulkCaseCreate.id
                }
            });
            for (let i = 0; i < req.files.length; i++) {
                await Fileuploads.create({
                    name: `/upload_Files/${req.files[i].originalname}`,
                    status: 0,
                    case_id: 0,
                    bulk_id: bulkCaseCreate.id,
                    filename: req.files[i].filename
                });
            }
            await Notifications.create({
                remarks: `${current_length.length} MACT Cases has been Added.`,
                receive_id: 1,
                status: 1,
                sender_id: req.user.id,
                img: req.user.avatar,
                name: req.user.first_name + " " + req.user.last_name,
                link: "/legalcart-mact"
            });
            req.flash('add-CT1-case', current_length.length + 'Cases Added Successfully');
            res.redirect('/legalcart-mact');
        }
    }
});

router.get("/assign-mact-all", auth, async (req, res) => {

    var add_case_status_lawyer = req.flash('add-status-case')[0];
    var assign_case = await lawyerAssignment.findAll({
        where: {
            lawyer_id: req.user.id,
            invitation_status: 0
        }
    });
    all_case_id = [];
    for (var i = 0; i < assign_case.length; i++) {
        all_case_id.push(assign_case[i].case_id)
    }
    AllCase.hasMany(MactCaseDetail, {
        foreignKey: 'case_id'
    });
    AllCase.hasMany(Conversation, {
        foreignKey: 'case_id'
    });
    var all_case = await AllCase.findAll({
        where: {
            id: all_case_id,
            case_type_id: 2,
            case_no: "0"
        },
        include: [{
            model: MactCaseDetail
        }, {
            model: Conversation
        }],
        order: [
            ['updatedAt', 'DESC'],
            [Conversation, 'id', 'DESC']
        ]
    });
    var rateChart = await RateList.findOne({
        where: {
            id: 2
        }
    });
    var lawyer_rate = await Rate.findOne({
        where: {
            name: rateChart.type_of_case
        },
        order: [
            ['id', 'DESC']
        ]
    });
    res.render("case/mact_case/lawyer_all_mact", {
        layout: "dashboard",
        title: "All MACT Case Lists",
        all_case,
        add_case_status_lawyer,
        lawyer_rate: lawyer_rate.rate_lawyers
    });
});


router.post("/delete-file_for_case", auth, async (req, res) => {

    await Fileuploads.destroy({
        where: {
            id:req.body.file_id
        }
    });

    res.json({
        success: true
    })

});

// ENDS MACT CASE SECTION BRATIN MEHETA
router.post("/close-particular-case-by-lawyer", auth, async(req, res)=> {
    var caseEmail = await AllCase.findOne({
        where: {
            id: req.body.case_id
        }
    });
    var emailCorporate = await User.findOne({
        where: {
            firm_id: caseEmail.firm_id,
            role_id: 3,
            sub_role: "C"
        }
    });
    var emailCityManager = await User.findOne({
        where: {
            id: caseEmail.customer_id,
        }
    });
    var sendEmailId = [emailCorporate.notification_email,emailCityManager.email,'info@legalkart.com']
    // var sendEmailId = [emailCorporate.notification_email,emailCityManager.email]
    await AllCase.update({
        status: 1
    }, {
        where: {
            id: req.body.case_id
        }
    });
    var cab_case = await AllCase.findOne({
        where: {
            id: req.body.case_id
        }
    })
    var case_no = cab_case.cab_no == "0" ? cab_case.case_no : cab_case.cab_no
    var msg = `${case_no} has been closed successfully.`
    
    await Notifications.create({
        name: `${req.user.first_name} ${req.user.last_name}`,
        remarks: msg,
        status: 1,
        sender_id: req.user.id,
        receive_id: 1,
        img: req.user.avatar,
        link: `/case-conversation/${req.body.case_id}`
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
                          <p style = "font-size: 30px; margin-bottom: 15px; margin-top: 10px; text-decoration: underline;" > Dear Team, </p>
                          <p style = "font-size: 18px;" > ${case_no} has a new status update: </p>
                          <p style = "font-size: 18px; font-family: &quot;OpenSans-Light&quot;,Calibri,Arial,sans-serif; text-align: center;">
                               <span style = "color:#FF851A; font-weight: bold;"> Case has been closed. </span> </p> 
    
                              <p style = "font-family: 'Open Sans Light',Calibri, Arial, sans-serif; font-size:18px; line-height:26px;"> &nbsp; </p>
                          <table width="325" border="0" cellspacing="0" cellpadding="0">
                            
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
    
    for(var e=0;e<sendEmailId.length;e++)
    {

        
    
            var request = await mailjet
                .post("send")
                .request({
                    "FromEmail": "bratin@wrctpl.com",
                    "FromName": "LegalKart",
                    "Subject": `${case_no} Alert`,
                    "Html-part": email_body,
                    "Recipients": [{
                        "Email": sendEmailId[e]
                    }]
                });
    }

    res.json({
        success: true
    })
})

router.post("/case/delete/manager",auth, async(req, res)=> {
    //     AllCase
    // cab_case_detail
    // BulkCase
    // AllCaseStatus
    // MactCaseDetail
   // console.log(req.body.delete_case_id);
    var thisCase = await AllCase.findOne({
        where: {
            id: req.body.delete_case_id
        }
    });
    //console.log(thisCase.case_type_id);
    //console.log(thisCase.bulk_case_id);
    var thisCaseBulk = await BulkCase.findOne({
        where: {
            id: thisCase.bulk_case_id
        }
    });
    var case_length = parseInt(thisCaseBulk.case_length) - 1;
    await BulkCase.update({
        case_length: case_length
    },{
        where: {
            id: thisCase.bulk_case_id
        }
    });
    await AllCaseStatus.destroy({
        where: {
            case_id:req.body.delete_case_id
        }
    });
    if(thisCase.case_type_id == "2")
    {
        await MactCaseDetail.destroy({
            where: {
                case_id:req.body.delete_case_id
            }
        });
    }
    else
    {
        await cab_case_detail.destroy({
            where: {
                case_id:req.body.delete_case_id
            }
        });
    }
    await AllCase.destroy({
        where: {
            id:req.body.delete_case_id
        }
    });
    req.flash('delete-case-by-manager', 'Case Deleted Successfully');
    res.redirect(`/challan/case/list/${thisCase.bulk_case_id}`);
});

router.get('/case-invitation', auth, async (req,res) => {

    var assign_case = await lawyerAssignment.findAll({
        where: {
            lawyer_id: req.user.id,
            invitation_status: 0
        }
    });
    all_case_id = [];
    for(var i=0; i<assign_case.length;i++)
    {
        all_case_id.push(assign_case[i].case_id)
    }
    AllCase.belongsTo(RateList, {
        foreignKey: 'case_type_id'
    });
    AllCase.hasMany(CabCaseDetail, {
        foreignKey: 'case_id'
    });
    AllCase.hasMany(Conversation, {
        foreignKey: 'case_id'
    });
    var all_case = await AllCase.findAll({
        where: {
            id: all_case_id,
            case_no:"0"
        },
        include: [{
            model: CabCaseDetail
        }, {
            model: Conversation
        },{
            model: RateList
        }],
        order: [
            ['updatedAt', 'DESC'],
            [Conversation, 'id', 'DESC']
        ]
    });

//     // console.log('object',invitation);

    res.render("case/invitation/invitation.hbs", {
        layout: "dashboard",
        title: "Invitation",
        invitation : all_case
    })

});

router.post('/invitation/case', auth, async (req,res) => {

    // console.log(req.user.first_name,req.user.last_name,req.body.case_name,req.body.case_id,req.user.id,req.user.avatar)
    // return true;

    const name = `${req.user.first_name} ${req.user.last_name}`;
    const accept = `${req.body.case_name} case has been Accept successfully`;
    const reject = `${req.body.case_name} case has been Reject successfully`;
    
    if (req.body.invitation_id == '2') {

        AllCase.belongsTo(BulkCase, {
            foreignKey: 'bulk_case_id'
        });

        const case_details = await AllCase.findOne({
            where: {
                id: req.body.case_id
            },
            include: [{
                model: BulkCase
            }]
        });

        await AllCase.update({
            status: 0
        }, {
            where: {
                id: req.body.case_id
            }
        });

        await BulkCase.update({
            case_length:  parseInt(case_details.bulk_case.case_length) + 1
        }, {
            where: {
                id: case_details.bulk_case.id
            }
        });
        
        // Reject By Lawyer 26-02-19
        await lawyerAssignment.update({
            invitation_status: 1
        },{
            where: {
                case_id: req.body.case_id,
                lawyer_id: req.user.id,
                invitation_status: 0
            }
        })
    }
    
    await Notifications.create({
        name: name,
        remarks : `${req.body.invitation_id=='1'? accept : reject }`,
        status:1,
        sender_id: req.user.id,
        receive_id: 1,
        img: req.user.avatar,
        link: `/legalcart-challan`
    });

    await AllCase.update({
        invitation: req.body.invitation_id
        },{
        where:{
            id:req.body.case_id
        }
    });

    res.redirect(`/case-invitation`);
});

router.post("/send-broadcast-msg", auth, async(req, res) => {
    var find_lawyer = await User.findAll({
        where: {
            role_id: 2
        }
    });
    for(var l=0; l< find_lawyer.length; l++)
    {
        var message = { 
            to: find_lawyer[l].device_fcm_id,
            collapse_key: 'green',
    
            notification: {
                title: 'LEGALKART',
                body: req.body.broadcast_msg
            },
    
        };
    
        fcm.send(message, (err, response) => {
            if (err) {
                console.log("Something has gone wrong!");
            } else {
                console.log("Successfully sent with response: ", response);
            }
        });
        client.messages
        .create({
            body: `LEGALKART:- ${req.body.broadcast_msg}`,
            from: '+19787679295',
            to: `+91${find_lawyer[l].mobile}`
        })
        .then(message => console.log('This message for twilor',message.sid))
        .done();
    }
    res.json({
        success: true
    })
});

module.exports = router;