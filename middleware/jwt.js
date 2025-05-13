const jwt = require('jsonwebtoken');
// JWT Middleware
// Per REQ 6.e, 6.f, 7.c, 7.d, 8.a, 9.a

// Per REQ 4.a, Use JWT_SECRET .env variable.
function verifyJWT(req, res, next) {
    const token = req.cookies['token'];
    if (!token) {
        return res.status(418).json({ message: 'Access denied' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.jwt = {...decoded};
        next();
    } catch (error) {
        res.status(418).json({ message: 'Invalid token' });
    }
};

module.exports = verifyJWT;