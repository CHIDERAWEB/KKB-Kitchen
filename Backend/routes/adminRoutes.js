import express from 'express';
// 1. Fixed the import for the middleware (must match your file path)
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';


import {
    approveRecipe,
    deleteRecipe,
    getAdminData,
    updateRecipeByAdmin,
    getAllUsers,
    toggleUserRole
} from '../controllers/adminController.js';

const router = express.Router();

// --- ALL ADMIN ROUTES ARE NOW PROTECTED ---
// This means: Valid Token MUST exist AND Role MUST be 'admin'

// 1. Get Dashboard Stats & Pending Recipes
router.get('/data', authenticateToken, isAdmin, getAdminData);

// 2. Approve a recipe
router.put('/approve/:id', authenticateToken, isAdmin, approveRecipe);

// 3. Delete a recipe
router.delete('/delete/:id', authenticateToken, isAdmin, deleteRecipe);

// 4. Update/Fix a recipe
router.put('/update/:id', authenticateToken, isAdmin, updateRecipeByAdmin);

// 5. User Management
router.get('/users', authenticateToken, isAdmin, getAllUsers);

// 6. Change User Roles
router.put('/users/role/:id', authenticateToken, isAdmin, toggleUserRole);


export default router;