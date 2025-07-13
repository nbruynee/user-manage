const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware')
const router = require('express').Router();

//admin
router.get('/', authMiddleware.verifyToken, authMiddleware.verifyAdmin, userController.getAllUser);
router.put('/:id', authMiddleware.verifyToken, authMiddleware.verifyAdmin, userController.adminUpdateUser);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.verifyAdmin, userController.deleteUser);

//user
router.get('/me', authMiddleware.verifyToken, userController.getMe);
router.put('/me', authMiddleware.verifyToken, userController.updateUser);

module.exports = router;

