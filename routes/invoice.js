const express = require('express');
const auth = require('../middlewares/auth');
const User = require("../models").user;
const LawyerAssign = require("../models").lawyer_assignment;
const AllCase = require("../models").all_case;
const RateList = require("../models").rate_list;
const Rate = require("../models").rate;
const Court = require('../models').court;
const CabCaseDetail = require('../models').cab_case_detail;
const Lawyers = require('../models').lawyer;
const LawyerBankDetail = require('../models').lawyer_bank_detail;
const Invoice = require('../models').invoice;
const InvoiceToCase = require('../models').invoice_to_case;
const InvoicePayment = require('../models').invoice_payment;
const Notifications = require("../models").notification;
const AdditionalCostCaseFile = require('../models').additional_cost_case_file;
const AdditionalCostCase = require('../models').additional_cost_case;
const MactCaseDetail = require('../models').mact_case_detail;
const LawyerRate = require('../models').lawyer_rate;
var fs = require('fs');
var pdf = require('dynamic-html-pdf');
var html = fs.readFileSync('./views/template.hbs', 'utf8');

//notification module for app
var FCM = require('fcm-node');
var serverKey = 'AAAA_X3Aq_8:APA91bGZ-iJ-I8CTjdC5y53P3jxi3iTG0JZpLTbiZsdfksCAy5k7h02F59sVsXls8kV22GlE7K_GGd9at-AFSlbJ9Jzhn5E2Pn0C98FZB0DDr61zSLeVxeq-8NzrBLzHBLY5bqqEqv1W'; //put your server key here
var fcm = new FCM(serverKey);

const router = express.Router();

var a = ['','one ','two ','three ','four ', 'five ','six ','seven ','eight ','nine ','ten ','eleven ','twelve ','thirteen ','fourteen ','fifteen ','sixteen ','seventeen ','eighteen ','nineteen '];
var b = ['', '', 'twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety'];

function inWords (num) {
    if ((num = num.toString()).length > 9) return 'overflow';
    n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return; var str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'only ' : '';
    return str;
}

router.get("/invoice", auth , async(req, res) => {
    Invoice.belongsTo(User, {
        foreignKey: 'user_id'
    });
    var whereCondition = {};
    if(req.user.role_id != "1")
    {
        whereCondition.user_id= req.user.id
    }
    var invoice = await Invoice.findAll({
        where: whereCondition,
        include: [{
            model:User
        }],
        order: [
            ['id', 'DESC']
        ]
    });
    res.render("invoice/index", {
        layout: "dashboard",
        title: "Invoice",
        invoice
    })
});

router.post("/lawyer-invoice-generate", auth, async(req, res) => {   
    var assign_case = await LawyerAssign.findAll({
        where: {
            lawyer_id: req.user.id,
            invoice_status: 0,
            invitation_status: 0
        }
    });
    if(assign_case.length == "0")
    {
        res.json({
            success_status: 2
        });
    }
    else
    {
        var case_id = [];
        for(var a=0; a<assign_case.length; a++)
        {
            case_id.push(assign_case[a].case_id);
        }
        var cases = await AllCase.findAll({
            where: {
                id: case_id,
                closeing_status: 1,
            }
        });
        if(cases.length == "0")
        {
            res.json({
                success_status: 3
            });
        }
        else
        {
            var invoice = [];
            var tot_rate = [];
            var close_case = [];
            for(var i=0; i<cases.length;i++)
            {
                close_case.push(cases[i].id);
                var case_type = await RateList.findOne({
                    where: {
                        id: cases[i].case_type_id
                    }
                });
                var case_details;
                if (cases[i].case_type_id != 2)
                {
                    case_details = await CabCaseDetail.findOne({
                        where: {
                            case_id: cases[i].id
                        }
                    });
                }
                else
                {
                    case_details = await MactCaseDetail.findOne({
                        where: {
                            case_id: cases[i].id
                        }
                    });
                }
                var court = await Court.findOne({
                    where: {
                        id: case_details.court_id
                    }
                });
                var rate = await LawyerRate.findOne({
                    where: {
                        lawyer_id: req.user.id,
                        case_type_id: cases[i].case_type_id
                    }
                });
                var additional_case = await AdditionalCostCase.findOne({
                    where: {
                        case_id: cases[i].id,
                    }
                });  
                var additional_cost =additional_case ? parseInt(additional_case.amount) : 0;
                var total_cost =  additional_cost + parseInt(rate.rate)
                tot_rate.push(parseInt(total_cost));
                invoice.push({
                    "serial_no" : i+1,
                    "service_type": case_type.type_of_case,
                    "case_no": cases[i].case_no == "0" ? cases[i].cab_no : cases[i].case_no,
                    "amount" : rate.rate,
                    "additional_cost": additional_cost,
                    "total_cost": total_cost,
                    "court": court ? court.name : "-",
                });
            }
            User.hasMany(Lawyers, {
                foreignKey: 'lawyer_id'
            });
            User.hasMany(LawyerBankDetail, {
                foreignKey: 'lawyer_id'
            });
            const lawyer = await User.findOne({
                where: {
                    id: req.user.id
                },
                include: [{
                    model: Lawyers
                }, {
                    model: LawyerBankDetail
                }]
            });
            var total_rate = tot_rate.reduce((a, b) => a + b, 0);
            var tot_rate_word = inWords(total_rate);
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
            var today = dd + '/' + mm + '/' + yyyy;
            var today_ = dd + '_' + mm + '_' + yyyy;
            var invoice_no = "legalkart" + "/"+ lawyer.id +"/" + today;
            var pdfName = Math.random().toString(11).replace('0.', '');
            var pdf_name = pdfName+"_"+lawyer.id+".pdf";

            var invoice_add = await Invoice.create({
                i_o_status: "I",
                user_id: req.user.id,
                invoice_no: invoice_no,
                total_amount: total_rate,
                payment_status: 0,
                status: 0,
                invoice_file: "/invoice/"+pdf_name
            });
            
            for (var q = 0; q < close_case.length; q++)
            {
                var invoice_to_case = await InvoiceToCase.create({
                    invoice_id: invoice_add.id,
                    case_id: close_case[q],
                    status: 0
                })
            }
        
            var options = await {
                format: "A4",
                orientation: "portrait",
                border: "10mm"
            };
            
            var document =await {
               // type: 'file',     // 'file' or 'buffer'
                template: html,
                context: {
                        lawyer: lawyer,
                        cases: invoice,
                        total_rate: total_rate,
                        tot_rate_word: tot_rate_word,
                        invoice_no: invoice_no,
                        today:today
                },
                path: "./public/invoice/"+pdf_name    // it is not required if type is buffer
            };
            await pdf.create(document, options)
            await LawyerAssign.update({
                invoice_status: 1
            }, {
                where: {
                    case_id: close_case,
                    lawyer_id: req.user.id
                }
            });
            await Notifications.create({
                remarks: "Invoice no.- " + invoice_no + " has been generated. Please make payment.",
                receive_id: 1,
                status: 1,
                sender_id: req.user.id,
                img: req.user.avatar,
                name: "Advocate " + req.user.first_name + " " + req.user.last_name,
                link: "/invoice"
            });
            res.json({
                success_status: 1
            });
        }
    }
});

router.post("/make-invoice-payment", auth, async(req,res) => {
    var invoice_pay = await InvoicePayment.create({
        invoice_id: req.body.invoice_id,
        user_id: req.body.lawyer_id,
        payment_mode:req.body.payment_method,
        payment_no: req.body.payment_no,
        remarks:req.body.remarks,
        status:0
    });
    await Invoice.update({
        payment_status: 1
    },{
        where: {
            id: req.body.invoice_id
        }
    });
    const invoice = await Invoice.findOne({
        where: {
            id: req.body.invoice_id
        }
    });
    await Notifications.create({
        remarks: "Payment released for the invoice no. of " + invoice.invoice_no,
        receive_id: invoice.user_id,
        status: 1,
        sender_id: req.user.id,
        img: req.user.avatar,
        name: "Admin",
        link: "/invoice"
    });
    // notification for app
    const useiDetails = await User.findOne({
        where: {
            id: invoice.user_id
        }
    });
    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
        to: useiDetails.device_fcm_id,
        collapse_key: 'green',

        notification: {
            title: 'LEGALKART',
            body: `LEGALKART:- Payment released for the invoice no. of ${invoice.invoice_no}.`
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
        success: true
    });
});

router.get("/get-invoice-payment-deatils/:id", auth, async (req, res) => {
    var invoice_detail = await InvoicePayment.findOne({
        where: {
            invoice_id: req.params['id']
        }
    });
    var invoice = await Invoice.findOne({
        where: {
            id: req.params['id']
        }
    })
    res.json({
        invoice_detail: invoice_detail,
        invoice: invoice
    });
});

router.post("/change-payment-status/:id", auth, async(req, res) => {
    const invoice = await Invoice.findOne({
        where: {
            id:req.params['id']
        }
    });
    await Invoice.update({
        payment_status: 2
    },{
        where: {
            id: req.params['id']
        }
    });
    await Notifications.create({
        remarks: "Payment received for the invoice no. of " + invoice.invoice_no,
        receive_id: 1,
        status: 1,
        sender_id: req.user.id,
        img: req.user.avatar,
        name: "Advocate " + req.user.first_name + " " + req.user.last_name,
        link: "/invoice"
    });
    res.json({
        success:true
    })
});
module.exports = router;