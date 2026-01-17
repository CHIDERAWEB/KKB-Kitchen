import { prisma } from '../config/db.js';
import { v2 as cloudinary } from 'cloudinary';

export const createRecipe = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Please upload an image" });
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'recipes',
        });

        const newRecipe = await prisma.recipe.create({
            data: {
                title: req.body.title,
                ingredients: typeof req.body.ingredients === 'string'
                    ? req.body.ingredients.split(',').map(i => i.trim())
                    : req.body.ingredients,
                instructions: Array.isArray(req.body.instructions)
                    ? req.body.instructions
                    : [req.body.instructions],
                // --- NEW FIELDS ADDED ---
                difficulty: req.body.difficulty || "Easy",
                servings: req.body.servings || "1",
                cookingTime: req.body.cookingTime || "0",
                imageUrl: result.secure_url,
                authorId: req.user.id,
                status: "pending"
            }
        });

        // NOTIFICATION LOGIC: Emit to all connected clients
        const io = req.app.get('socketio');
        if (io) {
            const updatedPendingCount = await prisma.recipe.count({
                where: { status: 'pending' }
            });

            io.emit("recipeCreated", {
                title: newRecipe.title,
                author: req.user.name || "A Chef",
                pendingCount: updatedPendingCount 
            });
        }

        return res.status(201).json({ message: "Recipe created!", recipe: newRecipe });

    } catch (err) {
        console.error("Create Recipe Error:", err);
        return res.status(500).json({ error: "Server failed to process recipe" });
    }
};

export const getAllRecipes = async (req, res) => {
    try {
        const recipes = await prisma.recipe.findMany({
            include: { author: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(recipes);
    } catch (error) {
        res.status(500).json([]);
    }
};

export const getRecipeById = async (req, res) => {
    try {
        const { id } = req.params;
        const recipeId = parseInt(id);

        if (isNaN(recipeId)) return res.status(400).json({ message: "Invalid ID format" });

        const recipe = await prisma.recipe.update({
            where: { id: recipeId },
            data: { views: { increment: 1 } },
            include: {
                author: { select: { name: true } },
                comments: { orderBy: { createdAt: 'desc' } }
            }
        });

        if (!recipe) return res.status(404).json({ message: "Recipe not found" });

        res.status(200).json(recipe);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

export const updateRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const recipeId = parseInt(id);
        let updateData = { ...req.body };

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, { folder: 'recipes' });
            updateData.imageUrl = result.secure_url;
        }

        const updated = await prisma.recipe.update({
            where: { id: recipeId },
            data: {
                title: updateData.title,
                ingredients: typeof updateData.ingredients === 'string'
                    ? updateData.ingredients.split(',').map(i => i.trim())
                    : updateData.ingredients,
                instructions: updateData.instructions,
                // --- UPDATE NEW FIELDS ---
                difficulty: updateData.difficulty,
                servings: updateData.servings,
                cookingTime: updateData.cookingTime,
                imageUrl: updateData.imageUrl,
                status: updateData.status
            }
        });

        if (updateData.status === 'approved') {
            const io = req.app.get('socketio');
            if (io) io.emit("recipeApproved", { title: updated.title });
        }

        res.json({ message: "Recipe updated successfully!", recipe: updated });
    } catch (error) {
        res.status(500).json({ error: "Update failed" });
    }
};

export const searchRecipes = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);
        const results = await prisma.recipe.findMany({
            where: {
                title: { contains: q, mode: 'insensitive' }
            },
            include: { author: { select: { name: true } } }
        });
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const toggleLike = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;
        const recipeId = parseInt(id);

        const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
        if (!recipe) return res.status(404).json({ message: "Recipe not found" });

        let likes = recipe.likedBy || [];
        const isAlreadyLiked = likes.includes(userId);

        likes = isAlreadyLiked ? likes.filter(i => i !== userId) : [...likes, userId];

        const updatedRecipe = await prisma.recipe.update({
            where: { id: recipeId },
            data: { likedBy: likes }
        });

        res.json({ liked: !isAlreadyLiked, count: updatedRecipe.likedBy.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getPopularRecipes = async (req, res) => {
    try {
        const popularRecipes = await prisma.recipe.findMany({
            take: 6,
            orderBy: { views: 'desc' },
            include: { author: { select: { name: true } } }
        });
        res.json(popularRecipes);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch popular recipes" });
    }
};

export const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { text, userName } = req.body;
        const recipeId = parseInt(id);
        const userId = req.user.id;

        const newComment = await prisma.comment.create({
            data: {
                text,
                userName: userName || "Anonymous Chef",
                recipeId: recipeId,
                userId: userId
            }
        });

        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json({ message: "Could not post comment" });
    }
};

export const updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const commentId = parseInt(id);
        const userId = req.user.id;
        const userRole = req.user.role;

        const comment = await prisma.comment.findUnique({ where: { id: commentId } });
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        if (comment.userId !== userId && userRole !== 'admin') {
            return res.status(403).json({ message: "You can only edit your own comments" });
        }

        const updatedComment = await prisma.comment.update({
            where: { id: commentId },
            data: { text: text }
        });

        res.json(updatedComment);
    } catch (error) {
        res.status(500).json({ error: "Failed to update comment" });
    }
};

export const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const commentId = parseInt(id);
        const userRole = req.user.role;

        const comment = await prisma.comment.findUnique({ where: { id: commentId } });
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        if (userRole !== 'admin') {
            return res.status(403).json({ message: "Not authorized to delete this" });
        }

        await prisma.comment.delete({ where: { id: commentId } });
        res.json({ message: "Comment deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete comment" });
    }
};

export const getPendingCount = async (req, res) => {
    try {
        const count = await prisma.recipe.count({ where: { status: 'pending' } });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: "Error counting pending recipes" });
    }
};

export const rejectRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminNote } = req.body;
        const recipeId = parseInt(id);

        const recipe = await prisma.recipe.findUnique({
            where: { id: recipeId },
            include: { author: true }
        });

        if (!recipe) return res.status(404).json({ error: "Recipe not found" });

        const updatedRecipe = await prisma.recipe.update({
            where: { id: recipeId },
            data: { 
                status: 'rejected',
                adminNote: adminNote 
            }
        });

        const io = req.app.get('socketio');
        if (io) {
            io.emit("recipeRejected", {
                authorId: recipe.authorId,
                title: recipe.title,
                reason: adminNote || "No specific reason provided."
            });

            const updatedCount = await prisma.recipe.count({ where: { status: 'pending' } });
            io.emit("updatePendingCount", { count: updatedCount });
        }

        res.json({ message: "Recipe rejected and feedback saved", recipe: updatedRecipe });
    } catch (error) {
        console.error("Reject Error:", error);
        res.status(500).json({ error: "Failed to reject recipe" });
    }
};

// --- NEW: RATE RECIPE ---
export const rateRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, userId } = req.body;
        const recipeId = parseInt(id);

        const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
        if (!recipe) return res.status(404).json({ error: "Recipe not found" });

        // Store as array of objects in JSON column
        let currentRatings = recipe.ratings || [];
        currentRatings = currentRatings.filter(r => r.userId !== userId);
        currentRatings.push({ userId, value: parseInt(rating) });

        const updatedRecipe = await prisma.recipe.update({
            where: { id: recipeId },
            data: { ratings: currentRatings }
        });

        res.json({ message: "Rating saved!", ratings: updatedRecipe.ratings });
    } catch (error) {
        res.status(500).json({ error: "Failed to save rating" });
    }
};