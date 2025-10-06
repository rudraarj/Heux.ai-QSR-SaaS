const express = require('express')
const authController = require('../constrollers/authController');
const { identifier } = require('../middlewares/identification');

const router = express.Router();

router.post('/signup',authController.signup);
router.post('/admin-account',identifier,authController.createAdminaccount)
router.post('/signin',authController.signin);
router.post('/logout',identifier,authController.logout);

router.get('/admins',identifier,authController.fetchadmin);

router.patch('/admins/:id',identifier,authController.updateAdmin);
router.patch('/send-verification-code',identifier,authController.sendVerificationCode)
router.patch('/verify-verification-code',identifier,authController.verifyVericationCode)
router.patch('/change-password',identifier,authController.changePassword)
router.patch('/send-forgot-password-code',authController.sendForgotPasswordCode)
router.patch('/verify-forgot-password-code',authController.verifyForgotPasswordCode)

router.delete('/admins/:id',identifier,authController.deleteAdmin);


module.exports = router;