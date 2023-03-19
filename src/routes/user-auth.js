const express = require('express');
const router = express.Router();
const authController = require('../controllers/user-auth');

router.get('/checknumber/:phonenumber', authController.checkPhoneNumber);

// router.get('/sendOtp/:phonenumber',authController.sendOtp);

router.get('/verifyOtp',authController.verifyotp);

router.post('/login',authController.login);

router.post('/social-login',authController.socialLogin);

router.patch('/resetPswd',authController.resetPassword);

router.post('/signup',authController.signup);

router.post('/refreshToken',authController.refreshToken);

router.get('/sendmail/:email' ,authController.sendEmail);

router.post('/logout',authController.logout);

router.get('/sendOtp/:phonenumber',authController.sendotp);

module.exports = router;