import express from 'express';
import { googleLogin, login, register, resendOTP, verifyOTP } from '../controllers/authController.js';
// You don't import the router, you initialize it from express
const router = express.Router();


router.post('/google-login', googleLogin);
router.post('/register', register);
router.post('/login', login);
router.post('/verifyOTP', verifyOTP);
router.post('/resend-otp', resendOTP);

export default router;