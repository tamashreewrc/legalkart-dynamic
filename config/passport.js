const bCrypt = require('bcrypt-nodejs');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models').user;
const Role = require('../models').role;

module.exports = (passport) => {
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser((id, done) => {
        User.belongsTo(Role, {
            foreignKey: 'role_id'
        });
        User.findOne({
            where: {
                id
            },
            include: [{
                model: Role
            }]
        }).then(user => {
            if (user) {
                done(null, user);
            } else {
                done(user.errors, null);
            }
        });
    });

    passport.use('local-login',
        new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        }, (req, email, password, done) => {
            var isValidPassword = function (userpass, password) {
                return bCrypt.compareSync(password, userpass);
            }

            // if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
            //     return done(null, false, req.flash('loginMessage', 'Please select captcha'));
            // }

            User.findOne({
                attributes: {
                    exclude: ['createdAt', 'updatedAt']
                },
                where: {
                    email: email
                }
            }).then(user => {
                    
                if (!user) {
                    return done(null, false, req.flash('loginMessage', 'Wrong Username or password'));
                }
                if (!isValidPassword(user.password, password)) {
                    return done(null, false, req.flash('loginMessage', 'Wrong Username or password'));
                }
                if(user.actual_user_id)
                {
                    return done(null, false, req.flash('loginMessage', 'corporate admin has working on your account.please try again after some time.'));
                }
                if (user.activate_email_status !== 1) {
                    return done(null, false, req.flash('loginMessage', 'Account not activated. Please check email and activate your account'));
                }
                var userinfo = user.get();
                return done(null, userinfo);
            }).catch(err => {
                console.log(err);
                return done(null, false, req.flash('loginMessage', 'Something wrong. Please try again.'));
            });
        })
    )

    passport.use('local-login-corporate-user-login',
        new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        }, (req, email, password, done) => {
            // var isValidPassword = function (userpass, password) {
            //     return bCrypt.compareSync(password, userpass);
            // }

            // if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
            //     return done(null, false, req.flash('loginMessage', 'Please select captcha'));
            // }
            req.logout();
            User.findOne({
                attributes: {
                    exclude: ['createdAt', 'updatedAt']
                },
                where: {
                    email: email
                }
            }).then(user => {
                    
                if (!user) {
                    return done(null, false, req.flash('loginMessage', 'Wrong Username or password'));
                }
                if (user.password != password) {
                    return done(null, false, req.flash('loginMessage', 'Wrong Username or password'));
                }
                
                if (user.activate_email_status !== 1) {
                    return done(null, false, req.flash('loginMessage', 'Account not activated. Please check email and activate your account'));
                }
                var userinfo = user.get();
                return done(null, userinfo);
            }).catch(err => {
                console.log(err);
                return done(null, false, req.flash('loginMessage', 'Something wrong. Please try again.'));
            });
        })
    )
};
