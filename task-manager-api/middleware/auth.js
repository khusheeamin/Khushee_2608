const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET || 'development-secret-change-me');
        next();
    } catch (error) {
        return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
};

module.exports = auth;