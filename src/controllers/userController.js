const bcrypt = require('bcrypt')
const { auditLogsRepo, userRepo } = require('../data/mockData');
const notificationSender = require('../utils/notificationSender')

const userController = {
    // GET ALL USER 
    getAllUser: async (req, res) => {
        try {
            const users = await userRepo.findAll();

            await auditLogsRepo.addLog({
                userId: req.user.id,
                action: 'get_all_users',
                status: 'success',
                requestMeta: { adminEmail: req.user.email }
            })
            res.status(200).json({ message: "Get all user successful", users });
        } catch (err) {
            await auditLogsRepo.addLog({
                userId: req.user ? req.user.id : 'N/A',
                action: 'get_all_users',
                status: 'failed',
                requestMeta: { adminEmail: req.user ? req.user.email : 'N/A', error: err.message }
            })
            res.status(500).json({ message: "Something wrong", error: err.message })
        }
    },

    // DELETE USERs
    deleteUser: async (req, res) => {
        try {
            const userToDelete = await userRepo.findById(req.params.id);
            if (!userToDelete) {
                await auditLogsRepo.addLog({
                    userId: req.user.id,
                    action: 'delete_user_failed',
                    status: 'failed',
                    requestMeta: { targetUserId: req.params.id, reason: 'User not found' }
                })
                return res.status(404).json({ message: "User does not exist!" });
            }

            await userRepo.findByIdAndDelete(req.params.id);

            await auditLogsRepo.addLog({
                userId: req.user.id,
                action: 'delete_user_success',
                status: 'success',
                requestMeta: { targetUserId: req.params.id, targetUserEmail: userToDelete.email }
            })
            res.status(200).json({ message: `Delete ${userToDelete.email} successfully` });
        } catch (err) {
            await auditLogsRepo.addLog({
                userId: req.user ? req.user.id : 'N/A',
                action: 'delete_user_failed',
                status: 'failed',
                requestMeta: { targetUserId: req.params.id, error: err.message }
            })
            res.status(500).json({ message: "Somethings wrong", error: err.message })
        }
    },

    // GET OWNER USER 
    getMe: async (req, res) => {
        try {
            const userId = req.user.id;
            const user = await userRepo.findById(userId);

            if (!user) {
                await auditLogsRepo.addLog({
                    userId: userId,
                    action: 'get_own_profile_failed',
                    status: 'failed',
                    requestMeta: { reason: 'User not found' }
                })
                return res.status(404).json({ message: "User not found!" })
            }

            const { password, ...otherUserData } = user;

            await auditLogsRepo.addLog({
                userId: userId,
                action: 'get_own_profile',
                status: 'success',
                requestMeta: { email: user.email }
            })

            res.status(200).json(
                {
                    message: "Get user information successfully",
                    ...otherUserData
                })
        } catch (err) {
            await auditLogsRepo.addLog({
                userId: req.user ? req.user.id : 'N/A',
                action: 'get_own_profile_failed',
                status: 'error',
                requestMeta: { error: err.message }
            })
            res.status(500).json({ message: "An error occurred while retrieving profile information.", error: err.message })
        }
    },

    updateUser: async (req, res) => {
        try {
            const userId = req.user.id;
            const { password, name, phone } = req.body;

            const userToUpdate = await userRepo.findById(userId);
            if (!userToUpdate) {
                await auditLogsRepo.addLog({
                    userId: userId,
                    action: 'update_own_profile_failed',
                    status: 'failed',
                    requestMeta: { reason: 'User not found' }
                })
                return res.status(404).json({ message: 'User not found' })
            }

            const updateField = {};
            const changes = {};

            if (name && userToUpdate.profile.name !== name) {
                updateField['profile.name'] = name;
                changes.name = {
                    old: userToUpdate.profile.name,
                    new: name
                }
            }
            if (phone && userToUpdate.profile.phone !== phone) {
                updateField['profile.phone'] = phone;
                changes.phone = {
                    old: userToUpdate.profile.phone,
                    new: phone
                }
            }

            if (password) {
                const salt = await bcrypt.genSalt(10);
                const hashedNewPwd = await bcrypt.hash(password, salt);
                updateField.password = hashedNewPwd;
                changes.password = 'updated';
            }

            const finalUpdateData = { ...updateField };
            if (updateField['profile.name'] || updateField['profile.phone']) {
                finalUpdateData.profile = {
                    ...userToUpdate.profile,
                    ...(updateField['profile.name'] ? { name: updateField['profile.name'] } : {}),
                    ...(updateField['profile.phone'] ? { phone: updateField['profile.phone'] } : {})
                }
            }
            const updatedUser = await userRepo.findByIdAndUpdate(userId, finalUpdateData);

            await auditLogsRepo.addLog({
                userId: userId,
                action: 'update_own_profile',
                status: 'success',
                requestMeta: { email: updatedUser.email, changes }
            })

            notificationSender.sendNotification(updatedUser.id, 'email', `Your profile has been updated.`, updatedUser.email, updatedUser.profile.phone)

            const { password: hashed, ...others } = updatedUser;

            res.status(200).json({ message: "Update profile successfully", user: { ...others } })
        } catch (err) {
            await auditLogsRepo.addLog({
                userId: req.user ? req.user.id : 'N/A',
                action: 'update_own_profile_failed',
                status: 'failed',
                requestMeta: { error: err.message, payload: req.body }
            })
            return res.status(500).json({ message: "An error occurred while updating the profile.", error: err.message })
        }
    },

    adminUpdateUser: async (req, res) => {
        try {
            const userId = req.params.id;

            const { password, name, phone, role } = req.body;

            const userToUpdate = await userRepo.findById(userId);
            if (!userToUpdate) {
                await auditLogsRepo.addLog({
                    userId: req.user.id,
                    action: 'admin_update_user_failed',
                    status: 'failed',
                    requestMeta: { targetUserId: userId, reason: 'User not found' }
                })
                return res.status(404).json({ message: "User not exist" });
            }

            const updateFields = {};
            const changes = {};

            if (name && userToUpdate.profile.name !== name) {
                updateFields['profile.name'] = name;
                changes.name = { old: userToUpdate.profile.name, new: name };
            }
            if (phone && userToUpdate.profile.phone !== phone) {
                updateFields['profile.phone'] = phone;
                changes.phone = { old: userToUpdate.profile.phone, new: phone };
            }
            if (role && userToUpdate.role !== role) {
                updateFields.role = role;
                changes.role = { old: userToUpdate.role, new: role };
            }

            if (password) {
                const salt = await bcrypt.genSalt(10);
                const hashedNewPwd = await bcrypt.hash(password, salt)
                updateFields.password = hashedNewPwd;
                changes.password = 'updated';
            }

            const finalUpdateData = { ...updateFields }
            if (updateFields['profile.name'] || updateFields['profile.phone']) {
                finalUpdateData.profile = {
                    ...userToUpdate.profile,
                    ...(updateFields['profile.name'] ? { name: updateFields['profile.name'] } : {}),
                    ...(updateFields['profile.phone'] ? { phone: updateFields['profile.phone'] } : {})
                }
            }

            if (updateFields.role) {
                finalUpdateData.role = updateFields.role;
            }

            const updatedUser = await userRepo.findByIdAndUpdate(userId, finalUpdateData);

            await auditLogsRepo.addLog({
                userId: req.user.id,
                action: 'admin_update_user',
                status: 'success',
                requestMeta: { targetUserId: userId, targetUserEmail: updatedUser.email, changes }
            })

            notificationSender.sendNotification(updatedUser.id, 'email', 'Your profile has been updated by an administrator.', updatedUser.email, updatedUser.profile.phone)

            const { password: hashed, ...others } = updatedUser;
            res.status(200).json({ message: `Update email ${others.email} successfully`, user: { ...others } });
        } catch (err) {
            await auditLogsRepo.addLog({
                userId: req.user ? req.user.id : 'N/A',
                action: 'admin_update_user_failed',
                status: 'failed',
                requestMeta: { targetUserId: req.user.id, error: err.message, payload: req.body }
            })
            return res.status(500).json({ message: 'An error occurred while updating the profile.', error: err.message })
        }
    }
}

module.exports = userController;