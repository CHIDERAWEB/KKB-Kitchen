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
    updateComment,
    rejectRecipe, // Import this
    rateRecipe    // Import this
} from '../controllers/recipeController.js';

const router = express.Router();

// Configure multer
const upload = multer({ dest: 'uploads/' });

// --- 1. STATIC/SPECIFIC GET ROUTES ---
router.get('/all', getAllRecipes);
router.get('/popular', getPopularRecipes);
router.get('/search', searchRecipes);
router.get('/pending-count', protect, isAdmin, getPendingCount);

// --- 2. DYNAMIC ID ROUTE ---
router.get('/:id', getRecipeById);

// --- 3. INTERACTION ROUTES (Require Login) ---
router.post('/:id/like', protect, toggleLike);
router.post('/:id/rate', protect, rateRecipe); // NEW: Route for Star Ratings
router.post('/:id/comments', protect, addComment);
router.put('/comments/:id', protect, updateComment);
router.delete('/comments/:id', protect, deleteComment);

// --- 4. CREATE/UPDATE/REJECT ROUTES ---
router.post('/create', protect, upload.single('image'), createRecipe);
router.put('/:id', protect, upload.single('image'), updateRecipe);
router.post('/:id/reject', protect, isAdmin, rejectRecipe); // NEW: Route for Admin Rejection

export default router;