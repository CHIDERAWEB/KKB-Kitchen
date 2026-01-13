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

// --- GET ROUTES ---
router.get('/all', getAllRecipes);
router.get('/popular', getPopularRecipes);
router.get('/search', searchRecipes);
router.get('/pending-count', getPendingCount);

// --- COMMENT ROUTES ---
router.put('/comments/:id', protect, updateComment);
router.delete('/comments/:id', protect, deleteComment);
router.post('/:id/comments', addComment);

// --- RECIPE ID ROUTE ---
router.get('/:id', getRecipeById);

// --- PROTECTED ROUTES (Changed authenticateToken to protect) ---
router.post('/create', protect, upload.single('image'), createRecipe);
router.put('/:id', protect, upload.single('image'), updateRecipe);
router.post('/:id/like', toggleLike);

export default router;