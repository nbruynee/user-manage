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
            if (!user) {
                res.status(404).json({message: "User does not exist!"});
            }
            res.status(201).json({ message: `Delete ${user.email} successfully` });
        } catch (err) {
            res.status(500).json({ message: "Somethings wrong", error: message.err })
        }
    }
}

module.exports = userController;