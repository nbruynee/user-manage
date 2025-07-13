const jwt = require("jsonwebtoken");

const JWT_ACCESS_KEY = process.env.JWT_ACCESS_KEY;

const middlewareController = {
    // verifyToken
    verifyToken: (req, res, next) => {
        console.log('>>> [Middleware] verifyToken ĐƯỢC GỌI');
        const token = req.headers.token;
        if (token) {
            const accessToken = token.split(" ")[1];
            if (!accessToken) {
                console.log('>>> [Middleware] verifyToken: Tokens not provided');
                return res.status(401).json({ message: "Tokens not provided" });
            }
            jwt.verify(accessToken, JWT_ACCESS_KEY, (err, user) => {
                if (err) {
                    console.error('>>> [Middleware] Lỗi JWT Verify:', err.message);
                    return res.status(403).json("Token is invalid or expired");
                }
                console.log('>>> [Middleware] JWT Decoded Payload:', user);
                req.user = user;
                console.log('>>> [Middleware] req.user sau gán:', req.user);
                console.log('>>> [Middleware] Token VERIFIED, User ID:', req.user.id, 'User role:', req.user.role);
                next();
            });
        }
        else {
            console.log('>>> [Middleware] verifyToken: Không có token');
            return res.status(401).json({ message: "You are not authenticated" })
        }
    },

    verifyAdmin: (req, res, next) => {
        console.log('>>> [Middleware] verifyAdmin ĐƯỢC GỌI');
        console.log('>>> [Middleware] verifyAdmin: req.user hiện tại:', req.user);
        if (req.user && req.user.role === 'admin') {
            console.log('>>> [Middleware] verifyAdmin: LÀ ADMIN. Tiếp tục...');
            next();
        } else {
            console.log('>>> [Middleware] verifyAdmin: KHÔNG PHẢI ADMIN HOẶC KHÔNG CÓ QUYỀN. Chặn truy cập. Role hiện tại:', req.user ? req.user.role : 'Không có user info');
            return res.status(403).json({ message: "You don't have this access" })
        }
    },

}

module.exports = middlewareController;