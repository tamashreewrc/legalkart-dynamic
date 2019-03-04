const Firm = require('../models').firm;
const User = require('../models').user;
const AllCase = require('../models').all_case;
module.exports = async (req, res, next) => {
    if (req.isAuthenticated()) {
        var firm;
        if(req.user.firm_id != "0")
        {
            var firm_name = await Firm.findOne({
                where: 
                {
                  id: req.user.firm_id
                }
              });
              firm = `${firm_name.name} Legal Central`
        }
        else
        {
            firm = "Legal Central"
        }
        if(req.user.actual_user_id)
        {
            var actual_user = await User.findOne({
                where: {
                    id: req.user.actual_user_id
                }
            })
            res.locals.actual_user = actual_user
        }
        var all_cases_challan = await AllCase.findAll({
            where: {
                case_type_id: 7,
                status: 0
            }
        });
        var all_cases_superdari = await AllCase.findAll({
            where: {
                case_type_id: 6,
                status: 0
            }
        });
        var all_cases_mact = await AllCase.findAll({
            where: {
                case_type_id: 2,
                status: 0
            }
        });
        const ulrArr = req.originalUrl.split("/");
        delete req.user.password;
        res.locals.user = req.user;
        res.locals.client_url = ulrArr[1];
        res.locals.firm = firm;
        res.locals.new_challan_count = all_cases_challan.length != 0 ? `(${all_cases_challan.length})`: "";
        res.locals.new_superdari_count = all_cases_superdari.length != 0 ? `(${all_cases_superdari.length})`: "";
        res.locals.new_mact_count = all_cases_mact.length != 0 ? `(${all_cases_mact.length})`: "";
        res.locals.year = new Date().getFullYear();
        return next();
    }
    res.redirect('/');
};


