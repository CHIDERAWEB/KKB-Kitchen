import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { OAuth2Client } from 'google-auth-library';

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                role: 'user' // Default role
            }
        });

        res.status(201).json({ message: "User created successfully", userId: user.id });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(400).json({ error: "Registration failed. Email might already exist." });
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