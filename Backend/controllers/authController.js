import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { OAuth2Client } from 'google-auth-library';
import { sendVerificationEmail } from '../utils/emailService.js'; // Make sure the path is correct

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Clean the email to prevent accidental spaces or case issues
    const cleanEmail = email.toLowerCase().trim();

    // 2. Check if user already exists BEFORE trying to create
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists. Try logging in! 🍳",
      });
    }

    // 3. Hash password and generate 4-digit OTP
    const hashedPassword = await bcrypt.hash(password, 10);
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    // 4. Save the user to the database
    const user = await prisma.user.create({
      data: {
        name: name,
        email: cleanEmail,
        password: hashedPassword,
        role: "user",
        otp: otpCode,
        isVerified: false,
      },
    });

    // 5. Send the OTP email (wrapped in its own try/catch so it doesn't break registration)
    try {
      await sendVerificationEmail(user.email, user.name, otpCode);
    } catch (emailErr) {
      console.error(
        "Email service failed, but user record was created:",
        emailErr.message,
      );
    }

    // 6. Send Success Response
    return res.status(201).json({
      message: "User registered! Check your email for the code.",
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    // If it reaches here, it means Prisma or the Server crashed
    console.error("CRITICAL REGISTRATION ERROR:", error);
    return res.status(500).json({
      message: "Something went wrong in the kitchen (Server Error).",
      error: error.message, // This will tell us if columns are missing
    });
  }
};

     
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // --- FIXED: ADDED ROLE TO TOKEN ---
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // --- FIXED: SENDING ROLE & PICTURE TO FRONTEND ---
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role, // Header needs this for Admin button
                picture: user.picture || null
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error during login" });
    }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
    const { idToken } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        // 1. Look for user in Database
        let user = await prisma.user.findUnique({ where: { email } });

        // 2. If user doesn't exist, create them
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: email,
                    name: name || "Google User",
                    password: "", // Google users don't need a password
                    picture: picture,
                    role: 'user' // Default new users to 'user'
                }
            });
        }

        // 3. Generate Token (Including the Role!)
        const token = jwt.sign(
            { id: user.id, role: user.role }, // Payload
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // 4. Send everything back to the Frontend
        res.status(200).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role, // This keeps the Admin button visible
                picture: user.picture || picture // This keeps the Google image visible
            }
        });

    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(401).json({ error: "Invalid Google token" });
    }
};
// This goes in your Backend (e.g., authController.js)
export const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    // Basic validation to ensure both fields are sent
    if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
    }

    try {
        // 1. Find the user
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: "Chef not found! 🧐" });
        }

        // Check if they are already verified
        if (user.isVerified) {
            return res.status(400).json({ message: "This account is already verified. Please log in." });
        }

        // 2. Compare the OTP (Important: ensure types match, usually string to string)
        if (user.otp === otp) {
            // 3. Update the user and clear the OTP field
            const updatedUser = await prisma.user.update({
                where: { email },
                data: { 
                    isVerified: true, 
                    otp: null // Clearing the OTP so it can't be used again
                }
            });

            // Return success with user data (excluding password for security)
            const { password, ...userWithoutPassword } = updatedUser;
            
            return res.status(200).json({ 
                message: "Email verified successfully! Welcome to the kitchen! 🍳",
                user: userWithoutPassword 
            });
        } else {
            // If the code is wrong
            return res.status(400).json({ message: "Invalid OTP code. Please check your email again! ❌" });
        }
    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ message: "Server error during verification. Try again later." });
    }
};