const User = require('../models/User');

const userController = {
    // GET ALL USER 
    getAllUser: async (req, res) => {
        try {
            const user = await User.find();
            res.status(201).json({ message: "Get all user successful", user });
        } catch (err) {
            res.status(500).json({ message: "Something wrong", error: message.err })
        }
    },

    // DELETE USERs
    deleteUser: async (req, res) => {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            res.status(201).json({message: `Delete ${user.email} successfully`});
        } catch (err) {
            res.status(500).json({ message: "Somethings wrong", error: message.err })
        }
    }
}

module.exports = userController;