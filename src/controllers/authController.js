const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const authController = {
    registerUser: async (req, res) => {
        try {
            const { email, password, name, phone } = req.body;

            //hash password
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(password, salt);

            // create new user 
            const newUser = await new User({
                email,
                password: hashed,
                profile: {
                    name: name,
                    phone: phone
                }
            })

            // save to DB 
            const user = await newUser.save();

            res.status(200).json({
                message: "Register successful",
                user: {
                    id: user._id,
                    email: user.email,
                    password: hashed,
                    role: user.role,
                    profile: user.profile
                }
            })
        } catch (err) {
            console.error("Error while registering user:", err);
            res.status(500).json({ message: 'Registration failed!', error: err.message });
        }
    },
    loginUser: async (req, res) => {
        const { email, password } = req.body;
        try {
            const user = await User.findOne({ email: email });
            if (!user) {
                res.status(404).json({ message: "Invalid email!" });
            }
            const validPassword = await bcrypt.compare(
                password,
                user.password
            )
            if (!validPassword) {
                res.status(400).json({ message: "Invalid password!" })
            }
            if (email && validPassword) {
                const accessToken = jwt.sign(
                    {
                        id: user.id,
                        role: user.role,
                    },
                    process.env.JWT_ACCESS_KEY,
                    {expiresIn: '5m'},
                );
                

                const refreshToken = jwt.sign(
                    {
                        id: user.id,
                        role: user.role,
                    },
                    process.env.JWT_REFRESH_KEY,
                    {expiresIn: '365d'},
                );
                const {password, profile, ...others} = user._doc;
                res.status(200).json({ message: "Login successful", ...others, accessToken, refreshToken });
            }
        } catch (err) {
            res.status(500).json({ message: 'Login failed!', error: err.message });
        }
    }
};

module.exports = authController 