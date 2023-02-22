const express = require('express');
const usersController = require('../controllers/usersController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signUp', authController.signUp);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.post('/resetPassword/:token', authController.resetPassword);
//after this point all apis are protected
router.use(authController.protect);
router.post('/updateMe', usersController.updateMe);
router.post('/updatePassword', authController.updatePassword);
router.delete('/deleteMe', usersController.deleteMe);
router.route('/me').get(usersController.getMe, usersController.getUser);

//after this point all apis are restricted to admins only
router.use(authController.restrictTo('admin'));
router.get('/', usersController.getAllusers);
router
    .route('/:id')
    .get(usersController.getUser)
    .patch(usersController.updateUser)
    .delete(usersController.deleteUser);

module.exports = router;
