const jwt = require("jsonwebtoken");

const middlewareController = {
    // verifyToken
    verifyToken: (req, res, next) => {
        const token = req.headers.token;
        // console.log("Check token: ", token)
        if (token) {
            const accessToken = token.split(" ")[1];
            jwt.verify(accessToken, process.env.JWT_ACCESS_KEY, (err, user) => {
                if (err) {
                    res.status(403).json("Token is invalid or expired");
                }
                req.user = user;
                next();
            });
        }
        else {
            res.status(401).json("You are not authenticated")
        }
    },

    verifyAdminGetAllUser: (req, res, next) => {
        if (req.user && req.user.role == 'admin') {
            next();
        } else {
            res.status(403).json({ message: "You don't have this access(just Admin)" })
        }
    },

    // verify owner account or admin to delete
    verifyTokenAndAdminAuth: (req, res, next) => {
        middlewareController.verifyToken(req, res, () => {
            if (req.user.role == "admin") {
                next();
            }
            else {
                res.status(403).json({ message: `You're not allowed to delete other!` });
            }
        })
    }
}

module.exports = middlewareController;