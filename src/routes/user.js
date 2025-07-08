const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware')
const router = require('express').Router();

router.get('/', authMiddleware.verifyToken, authMiddleware.verifyAdmin, userController.getAllUser);
router.put('/:id', authMiddleware.verifyToken, authMiddleware.verifyAdmin, userController.adminUpdateUser);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.verifyAdmin, userController.deleteUser);

router.get('/me', authMiddleware.verifyToken, userController.getMe);
router.put('/me', authMiddleware.verifyToken, userController.updateMyProfile);

module.exports = router;

