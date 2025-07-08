const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_ACCESS_KEY = process.env.JWT_ACCESS_KEY;

const authController = {
    registerUser: async (req, res) => {
        try {
            const { email, password, name, phone } = req.body;

            // validate email, password
            if (!email || !password) {
                return res.status(400).json({ message: "Email and password are required!" })
            }

            const existEmail = await User.findOne({ email });
            if (existEmail) {
                return res.status(400).json({ message: `Email ${email} already exist!` })
            }

            //hash password
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(password, salt);

            // create new user 
            const newUser = await new User({
                email,
                password: hashed,
                profile: {
                    name: name || '',
                    phone: phone || '',
                }
            })

            // save to DB 
            const user = await newUser.save();

            res.status(201).json({
                message: "Register successful",
                user: {
                    id: user._id.toString(),
                    email: user.email,
                    role: user.role,
                    profile: user.profile
                }
            })
        } catch (err) {
            console.error("Error while registering user:", err);
            res.status(500).json({ message: 'Registration failed!', error: err.message });
        }
    },

    generateAccessToken: (user) => {
        return jwt.sign(
            {
                id: user._id.toString(),
                role: user.role,
            },
            JWT_ACCESS_KEY,
            { expiresIn: '30m' },
        );
    },

    loginUser: async (req, res) => {
        const { email, password } = req.body;
        try {
            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password are required!' });
            }

            const user = await User.findOne({ email: email });
            if (!user) {
                return res.status(404).json({ message: "Invalid email!" });
            }

            const validPassword = await bcrypt.compare(
                password,
                user.password
            )

            if (!validPassword) {
                return res.status(400).json({ message: "Invalid password!" })
            }
            if (email && password) {
                const accessToken = authController.generateAccessToken(user);

                const { password, profile, ...others } = user._doc;
                res.status(200).json({ message: "Login successful", ...others, accessToken });
            }
        } catch (err) {
            res.status(500).json({ message: 'Login failed!', error: err.message });
        }
    }
};

module.exports = authController 