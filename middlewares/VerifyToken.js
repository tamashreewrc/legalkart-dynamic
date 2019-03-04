var jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {

    var token = req.body.token;

    if (!token)
        return res.status(403).send({
            auth: false,
            message: 'No token provided.'
        });

    jwt.verify(token, 'worldisfullofdevelopers',(err, decoded) =>  {
        if (err)
            return res.status(500).send({
                auth: false,
                message: 'Failed to authenticate token.'
            });

        req.user = decoded;
        next();
    });

}

module.exports = verifyToken;