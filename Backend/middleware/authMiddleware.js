import jwt from 'jsonwebtoken';

// 1. Verify the Token
export const authenticateToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // This contains the user ID and Role
        next();
    } catch (err) {
        console.error("Auth Error:", err.message);
        res.status(401).json({ message: "Token is not valid" });
    }
};

// 2. Verify the Admin Role
export const isAdmin = (req, res, next) => {
    // Safety check: make sure authenticateToken ran first
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized. Please login first." });
    }

    if (req.user.role !== 'admin') {
        // Change this line:
        console.log(`Access Denied: User ${req.user.id} has role ${req.user.role?.toLowerCase() || 'none'}`);
        return res.status(403).json({ message: "Access denied, admin only" });
    }

    next();
};


