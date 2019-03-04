module.exports = (req, res, next) => {
    if (req.isAuthenticated())
    {
        if(req.user.role_id == 3 && req.user.sub_role == "C") {
            const ulrArr = req.originalUrl.split("/");
            delete req.user.password;
            res.locals.user = req.user;
            res.locals.client_url = ulrArr[1];
            return next();
        }
        else if(req.user.role_id == 5) {
            const ulrArr = req.originalUrl.split("/");
            delete req.user.password;
            res.locals.user = req.user;
            res.locals.client_url = ulrArr[1];
            return next();
        }
    } 
    req.flash('success-auth-message', 'You are not allowed to access this url.');
    res.redirect('/dashboard');
};