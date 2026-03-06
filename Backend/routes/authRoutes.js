import express from 'express';
// You don't import the router, you initialize it from express
const router = express.Router(); 
import { googleLogin, register, login,  verifyOTP } from '../controllers/authController.js';


router.post('/google-login', googleLogin);
router.post('/register', register);
router.post('/login', login);
router.post('/verifyOTP',  verifyOTP)

export default router;