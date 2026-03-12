import express from 'express';
import { googleLogin, login, register, resendOTP, verifyOTP } from '../controllers/authController.js';

const router = express.Router();

router.post('/google-login', googleLogin);
router.post('/register', register);
router.post('/login', login);

// CHANGE THIS LINE to match your frontend fetch call
router.post('/verify-otp', verifyOTP);

router.post('/resend-otp', resendOTP);

export default router;