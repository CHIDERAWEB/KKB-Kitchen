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
                imageUrl: result.secure_url,
                authorId: req.user.id,
                status: "pending"
            }
        });

        // NOTIFICATION LOGIC: Emit to all connected clients
        // --- UPDATED NOTIFICATION LOGIC ---
        const io = req.app.get('socketio');
        if (io) {
            // Fetch the updated count of all pending recipes
            const updatedPendingCount = await prisma.recipe.count({
                where: { status: 'pending' }
            });

            // Emit the event with BOTH the message and the new count
            io.emit("recipeCreated", {
                title: newRecipe.title,
                author: req.user.name || "A Chef",
                pendingCount: updatedPendingCount // Add this line
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
                title: {
                    contains: q,
                    mode: 'insensitive'
                }
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

        likes = isAlreadyLiked
            ? likes.filter(i => i !== userId)
            : [...likes, userId];

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

// 11. GET PENDING COUNT
export const getPendingCount = async (req, res) => {
    try {
        const count = await prisma.recipe.count({
            where: { status: 'pending' }
        });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: "Error counting pending recipes" });
    }
};

export const rejectRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body; // The reason typed in the modal
        const recipeId = parseInt(id);

        // 1. Find recipe to get author details before deleting
        const recipe = await prisma.recipe.findUnique({
            where: { id: recipeId },
            include: { author: true }
        });

        if (!recipe) return res.status(404).json({ error: "Recipe not found" });

        // 2. Delete the recipe
        await prisma.recipe.delete({ where: { id: recipeId } });

        // 3. Notify the Chef via Socket
        const io = req.app.get('socketio');
        if (io) {
            // Send specific rejection alert to the author
            io.emit("recipeRejected", {
                authorId: recipe.authorId,
                title: recipe.title,
                reason: reason || "No specific reason provided."
            });

            // Update the Admin's badge count globally
            const updatedCount = await prisma.recipe.count({ where: { status: 'pending' } });
            io.emit("updatePendingCount", { count: updatedCount });
        }

        res.json({ message: "Recipe rejected successfully" });
    } catch (error) {
        console.error("Reject Error:", error);
        res.status(500).json({ error: "Failed to reject recipe" });
    }
};