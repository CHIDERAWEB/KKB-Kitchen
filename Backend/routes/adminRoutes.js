import express from 'express';
// 1. Fixed the import - Changed authenticateToken to protect
import { protect, isAdmin } from '../middleware/authMiddleware.js';

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

// 1. Get Dashboard Stats & Pending Recipes
router.get('/data', protect, isAdmin, getAdminData);

// 2. Approve a recipe
router.put('/approve/:id', protect, isAdmin, approveRecipe);

// 3. Delete a recipe
router.delete('/delete/:id', protect, isAdmin, deleteRecipe);

// 4. Update/Fix a recipe
router.put('/update/:id', protect, isAdmin, updateRecipeByAdmin);

// 5. User Management
router.get('/users', protect, isAdmin, getAllUsers);

// 6. Change User Roles
router.put('/users/role/:id', protect, isAdmin, toggleUserRole);

export default router;