const PacticeArea = require('../models').pacticearea;
const SubPacticeArea = require('../models').sub_pacticearea;
const LegalService = require('../models').legal_service_category;
const SubLegalService = require('../models').legal_service_sub_category;
const State = require('../models').state;
module.exports = async (req, res, next) => {
    PacticeArea.hasMany(SubPacticeArea, {
        foreignKey: 'p_id'
    });
    const practice_area = await PacticeArea.findAll({
        include: [{
            model: SubPacticeArea
        }],
        order: [
            [SubPacticeArea, 'id', 'ASC']
        ]
    });
    const state = await State.findAll({
        order: [
            ['name', 'ASC'],
        ]
    });
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
    const ulrArr = req.originalUrl.split("/");
    res.locals.client_url = ulrArr[1];
    if (req.isAuthenticated()) {
        delete req.user.password;
        res.locals.user = req.user;
    }
    res.locals.practice_area = practice_area;
    res.locals.legal_service = legal_service;
    res.locals.state = state;
    res.locals.year = new Date().getFullYear();
    return next();
};