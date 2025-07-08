const User = require('../models/User');
const bcrypt = require('bcrypt')

const userController = {
    // GET ALL USER 
    getAllUser: async (req, res) => {
        try {
            const users = await User.find();
            res.status(200).json({ message: "Get all user successful", users });
        } catch (err) {
            res.status(500).json({ message: "Something wrong", error: err.message })
        }
    },

    // DELETE USERs
    deleteUser: async (req, res) => {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            if (!user) {
                return res.status(404).json({ message: "User does not exist!" });
            }
            res.status(200).json({ message: `Delete ${user.email} successfully` });
        } catch (err) {
            res.status(500).json({ message: "Somethings wrong", error: err.message })
        }
    },

    // GET OWNER USER 
    getMe: async (req, res) => {
        try {
            const userID = req.user.id;
            const user = await User.findById(userID);

            if (!user) {
                return res.status(404).json({ message: "User not found!" })
            }

            const { password, ...otherUserData } = user._doc;

            res.status(200).json(
                {
                    message: "Get user information successfully",
                    ...otherUserData
                })
        } catch (err) {
            res.status(500).json({ message: "An error occurred while retrieving profile information.", error: err.message })
        }
    },

    updateMyProfile: async (req, res) => {
        try {
            const userId = req.user.id;
            const { password, name, phone } = req.body;

            const userToUpdate = await User.findById(userId);
            if (!userToUpdate) {
                return res.status(404).json({ message: 'User not found' })
            }

            const updateField = {};

            if (name) updateField['profile.name'] = name;
            if (phone) updateField['profile.phone'] = phone;

            if (password) {
                const salt = await bcrypt.genSalt(10);
                updateField.password = await bcrypt.hash(password, salt);
            }

            const updatedUser = await User.findByIdAndUpdate
                (
                    userId,
                    { $set: updateField },
                    { new: true, runValidators: true }
                );

            const { password: hashed, ...others } = updatedUser._doc;

            res.status(200).json({ message: "Update profile successfully", user: { ...others } })
        } catch (err) {
            return res.status(500).json({ message: "An error occurred while updating the profile.", error: err.message })
        }
    },

    adminUpdateUser: async (req, res) => {
        try {
            const userId = req.params.id;

            const { password, name, phone, role } = req.body;

            const userToUpdate = await User.findById(userId);
            if (!userToUpdate) {
                return res.status(404).json({ message: "User not exist" });
            }

            const updateFields = {};

            if (name) updateFields['profile.name'] = name;
            if (phone) updateFields['profile.phone'] = phone;
            if (role) updateFields.role = role;

            if (password) {
                const salt = await bcrypt.genSalt(10);
                updateFields.password = await bcrypt.hash(password, salt);
            }

            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { $set: updateFields },
                { new: true, runValidators: true }
            );

            const { password: hashed, ...others } = updatedUser._doc;
            res.status(200).json({ message: `Update email ${others.email} successfully`, user: { ...others } });
        } catch (err) {
            return res.status(500).json({ message: 'An error occurred while updating the profile.', error: err.message })
        }
    }
}

module.exports = userController;