const userController = require('../controllers/userController');
const middlewareController = require('../middleware/authMiddleware')
const router = require('express').Router();

router.get('/', middlewareController.verifyToken, middlewareController.verifyAdminGetAllUser, userController.getAllUser);
router.delete('/:id', middlewareController.verifyTokenAndAdminAuth, userController.deleteUser);

module.exports = router;


