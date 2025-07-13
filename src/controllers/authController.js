const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { userRepo, auditLogsRepo } = require('../data/mockData')
const notificationSender = require('../utils/notificationSender')

const JWT_ACCESS_KEY = process.env.JWT_ACCESS_KEY;

const authController = {
    registerUser: async (req, res) => {
        try {
            const { email, password, name, phone } = req.body;

            // validate email, password
            if (!email || !password) {
                await auditLogsRepo.addLog({
                    action: 'register_failed',
                    status: 'failed',
                    requestMeta: { email: email || 'N/A', reason: 'Missing authentication information' }
                })
                return res.status(400).json({ message: "Email and password are required!" })
            }

            const existEmail = await userRepo.findByEmail(email);
            if (existEmail) {
                await auditLogsRepo.addLog({
                    action: 'register_failed',
                    status: 'failed',
                    requestMeta: { email, reason: `Email already exists!` }
                })
                return res.status(400).json({ message: `Email ${email} already exist!` })
            }

            //hash password
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(password, salt);

            // create new user 
            const newUser = {
                email,
                password: hashed,
                profile: {
                    name: name || '',
                    phone: phone || '',
                }
            };

            // save to DB 
            const user = await userRepo.create(newUser);

            await auditLogsRepo.addLog({
                userId: user.id,
                action: 'register_success',
                status: 'success',
                requestMeta: { email: user.email }
            })

            notificationSender.sendNotification(user.id, 'email', `Welcome to the platform, ${user.profile.name || user.email}!`, user.email, null)

            res.status(201).json({
                message: "Register successful",
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    profile: user.profile
                }
            })
        } catch (err) {
            console.error("Error while registering user:", err);
            await auditLogsRepo.addLog({
                action: 'register_error',
                status: 'error',
                requestMeta: { email: req.body.email || 'N/A', error: err.message }
            })
            res.status(500).json({ message: 'Registration failed!', error: err.message });
        }
    },

    generateAccessToken: (user) => {
        return jwt.sign(
            {
                id: user.id,
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
                await auditLogsRepo.addLog({
                    action: 'login_failed',
                    status: 'failed',
                    requestMeta: { email: email || 'N/A', reason: 'Missing authentication information' }
                })
                return res.status(400).json({ message: 'Email and password are required!' });
            }

            const user = await userRepo.findByEmail(email);
            if (!user) {
                await auditLogsRepo.addLog({
                    action: 'login_failed',
                    status: 'failed',
                    requestMeta: { email, reason: 'Invalid email!' }
                })
                return res.status(404).json({ message: "Invalid email!" });
            }

            const validPassword = await bcrypt.compare(
                password,
                user.password
            )

            if (!validPassword) {
                await auditLogsRepo.addLog({
                    userId: user.id,
                    action: 'login_failed',
                    status: 'failed',
                    requestMeta: { email: user.email, reason: 'Invalid password!' }
                })
                return res.status(400).json({ message: "Invalid password!" })
            }
            if (email && password) {
                const accessToken = authController.generateAccessToken(user);

                auditLogsRepo.addLog({
                    userId: user.id,
                    action: 'login_success',
                    status: 'success',
                    requestMeta: { email: user.email }
                });

                notificationSender.sendNotification(user.id, 'email', `You have successfully logged in.`, user.email, null)

                const { password: hashed, profile, ...others } = user;
                res.status(200).json({ message: "Login successful", ...others, accessToken });
            }
        } catch (err) {
            console.error("Error while login", err);
            auditLogsRepo.addLog({
                action: 'login_failed',
                status: 'failed',
                requestMeta: { email: req.body.email || 'N/A', error: err.message }
            })
            res.status(500).json({ message: 'Login failed!', error: err.message });
        }
    }
};

module.exports = authController 