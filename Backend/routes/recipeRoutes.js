import express from 'express';
import multer from 'multer';
import {
    createRecipe,
    getAllRecipes,
    getPopularRecipes,
    getRecipeById,
    searchRecipes,
    toggleLike,
    addComment,
    getPendingCount, // Ensure this is imported
    deleteComment
} from '../controllers/recipeController.js';

import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure multer for image uploads
const upload = multer({ dest: 'uploads/' });

// --- POST ROUTES ---
router.post('/create', authenticateToken, upload.single('image'), createRecipe);
router.post('/:id/like', toggleLike);
router.post('/:id/comments', addComment);
router.delete('/comments/:id', authenticateToken, deleteComment);

// --- GET ROUTES ---
router.get('/all', getAllRecipes);
router.get('/popular', getPopularRecipes);
router.get('/search', searchRecipes);

/** * CRITICAL FIX: 
 * We move /pending-count ABOVE /:id.
 * This prevents Express from thinking "pending-count" is a Recipe ID.
 */
router.get('/pending-count', getPendingCount);

// This must stay at the bottom of the GET routes
router.get('/:id', getRecipeById);

export default router;