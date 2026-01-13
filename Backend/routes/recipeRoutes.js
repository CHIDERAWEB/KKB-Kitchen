import express from 'express';
import multer from 'multer';
import { protect, isAdmin } from '../middleware/authMiddleware.js';
import {
    createRecipe,
    getAllRecipes,
    getPopularRecipes,
    getRecipeById,
    searchRecipes,
    toggleLike,
    addComment,
    getPendingCount,
    deleteComment,
    updateRecipe,
    updateComment
} from '../controllers/recipeController.js';

const router = express.Router();

// Configure multer
const upload = multer({ dest: 'uploads/' });

// --- 1. STATIC/SPECIFIC GET ROUTES (Keep these at the top) ---
router.get('/all', getAllRecipes);
router.get('/popular', getPopularRecipes);
router.get('/search', searchRecipes);
router.get('/pending-count', protect, isAdmin, getPendingCount); // Added protection for admin only

// --- 2. DYNAMIC ID ROUTE (Must be below specific routes) ---
router.get('/:id', getRecipeById);

// --- 3. INTERACTION ROUTES (Require Login) ---
// If your controller needs the user ID to save a like or comment, you MUST use 'protect'
router.post('/:id/like', protect, toggleLike);
router.post('/:id/comments', protect, addComment);
router.put('/comments/:id', protect, updateComment);
router.delete('/comments/:id', protect, deleteComment);

// --- 4. CREATE/UPDATE ROUTES (Require Login + Uploads) ---
router.post('/create', protect, upload.single('image'), createRecipe);
router.put('/:id', protect, upload.single('image'), updateRecipe);

export default router;