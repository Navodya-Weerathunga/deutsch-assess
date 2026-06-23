// middleware/auth.js

require('dotenv').config();

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function verifyToken(req, res, next) {
    const token = req.cookies.authToken;

    if (!token) {
        return res.status(401).json({ msg: "No token provided, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ msg: "Invalid token, authorization denied" });
    }

    // Optional middleware for explicit admin check
    function isAdmin(req, res, next) {
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({ msg: 'Access denied. Admins only.' });
        }
        next();
    }

    // General role-based access control middleware
    const checkRole = (role) => {
        return (req, res, next) => {
            if (req.user && req.user.role === role) {
                next();
            } 
            
            else {
                return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
            }
        };
    };


    //  Export all middleware
    module.exports = {
        verifyToken,
        isAdmin,
        checkRole,
    };
}