import express from 'express';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

import {
    approveRecipe,
    rejectRecipe,
    getAdminData,
    updateRecipeByAdmin,
    getAllUsers,
    toggleUserRole,
    getPendingCount 
} from '../controllers/adminController.js';

const router = express.Router();

/**
 * --- MONITORING & ANALYTICS ---
 */

// Get full dashboard statistics and pending recipe list
router.get('/data', protect, isAdmin, getAdminData);

// Quick check for pending count (ideal for navbar notification badges)
router.get('/pending-count', protect, isAdmin, getPendingCount);


/**
 * --- RECIPE MODERATION ---
 */

// Approve a recipe: Changes status to 'approved' and notifies Chef
router.put('/approve/:id', protect, isAdmin, approveRecipe);

// Reject a recipe: Changes status to 'rejected' and sends admin feedback
router.put('/reject/:id', protect, isAdmin, rejectRecipe);

// Admin Edit: Fixes typos or ingredient lists directly
router.put('/update/:id', protect, isAdmin, updateRecipeByAdmin);


/**
 * --- USER & PERMISSIONS MANAGEMENT ---
 */

// Fetch all registered users for the management directory
router.get('/users', protect, isAdmin, getAllUsers);

// Toggle roles: Promote to 'admin' or demote to 'user'
// Note: URL structure matches the fetch call in your React component
router.put('/users/:id/role', protect, isAdmin, toggleUserRole);

export default router;