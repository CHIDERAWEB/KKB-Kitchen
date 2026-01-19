// import jwt from 'jsonwebtoken';

// // 1. Verify the Token (Renamed to 'protect')
// export const protect = (req, res, next) => {
//     const authHeader = req.header('Authorization');
//     const token = authHeader && authHeader.split(' ')[1];

//     if (!token) {
//         return res.status(401).json({ message: "No token, authorization denied" });
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decoded; // This contains the user ID and Role
//         next();
//     } catch (err) {
//         console.error("Auth Error:", err.message);
//         res.status(401).json({ message: "Token is not valid" });
//     }
// };

// // 2. Verify the Admin Role
// export const isAdmin = (req, res, next) => {
//     if (!req.user) {
//         return res.status(401).json({ message: "Unauthorized. Please login first." });
//     }

//     if (req.user.role !== 'admin') {
//         console.log(`Access Denied: User ${req.user.id} has role ${req.user.role?.toLowerCase() || 'none'}`);
//         return res.status(403).json({ message: "Access denied, admin only" });
//     }

//     next();
// };

import jwt from 'jsonwebtoken';

/**
 * 1. PROTECT MIDDLEWARE (Authentication)
 * Verifies the JWT and attaches the user payload to the request object.
 */
export const protect = (req, res, next) => {
    // Look for 'Authorization' header (standard: 'Bearer <token>')
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "No token provided, authorization denied" });
    }

    try {
        // Decode token using the environment secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach the user (ID and Role) to the request object for the next middleware
        req.user = decoded; 
        next();
    } catch (err) {
        console.error("Auth Error:", err.message);
        res.status(401).json({ message: "Token is not valid or has expired" });
    }
};

/**
 * 2. ISADMIN MIDDLEWARE (Authorization)
 * Checks if the authenticated user has the required 'admin' permissions.
 */
export const isAdmin = (req, res, next) => {
    // req.user must exist (meaning 'protect' was called first)
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized. Please login first." });
    }

    // Check role - converted to lowercase for safety
    const userRole = req.user.role?.toLowerCase();

    if (userRole !== 'admin') {
        console.warn(`SECURITY ALERT: Unauthorized access attempt by UID: ${req.user.id} | Role: ${userRole}`);
        return res.status(403).json({ message: "Forbidden: Admin privileges required." });
    }

    // User is an admin, proceed to the controller
    next();
};