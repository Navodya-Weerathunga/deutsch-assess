// middleware/checkRole.js

module.exports = function (...requiredRoles) {

    return (req, res, next) => {

        // -----------------------------------------
        // Ensure User is Authenticated
        // -----------------------------------------

        if (!req.user) {

            return res.status(401).json({
                msg: "User not authenticated"
            });

        }


        // -----------------------------------------
        // Check User Role
        // -----------------------------------------

        if (
            !requiredRoles.includes(
                req.user.role
            )
        ) {

            return res.status(403).json({
                msg: "Access denied"
            });

        }


        // -----------------------------------------
        // Role Accepted
        // -----------------------------------------

        next();

    };

};