import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/authMiddleware.js';
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
    updateRecipe, // Added this in case you need to edit
    updateComment
} from '../controllers/recipeController.js';

import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure multer
const upload = multer({ dest: 'uploads/' });

// --- GET ROUTES (Order matters!) ---
router.get('/all', getAllRecipes);
router.get('/popular', getPopularRecipes);
router.get('/search', searchRecipes);
router.get('/pending-count', getPendingCount);
// Add this near your other comment routes
router.put('/comments/:id', protect, updateComment);

// Single recipe must be AFTER specific words like 'all' or 'search'
router.get('/:id', getRecipeById);

// --- POST/PUT/DELETE ROUTES ---
router.post('/create', authenticateToken, upload.single('image'), createRecipe);
router.put('/:id', authenticateToken, upload.single('image'), updateRecipe); // Added for Admin edits
router.post('/:id/like', toggleLike);
router.post('/:id/comments', addComment);
router.delete('/comments/:id', authenticateToken, deleteComment);

export default router;