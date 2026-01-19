import { prisma } from '../config/db.js';
import { v2 as cloudinary } from 'cloudinary';

// --- HELPER FOR DATA PARSING ---
// Ensures data from FormData (strings) is converted to types 
// required by your Prisma Schema (String[] and String).
const parseRecipeData = (body) => {
    let ingredients = [];
    let instructions = [];

    // 1. Handle Ingredients (String[])
    try {
        if (typeof body.ingredients === 'string') {
            // Check if it's a JSON string like "['salt', 'pepper']"
            if (body.ingredients.startsWith('[')) {
                ingredients = JSON.parse(body.ingredients);
            } else {
                // Treat as comma-separated string
                ingredients = body.ingredients.split(',').map(i => i.trim()).filter(Boolean);
            }
        } else if (Array.isArray(body.ingredients)) {
            ingredients = body.ingredients;
        }
    } catch (e) {
        ingredients = [];
    }

    // 2. Handle Instructions (String[])
    try {
        if (typeof body.instructions === 'string') {
            if (body.instructions.startsWith('[')) {
                instructions = JSON.parse(body.instructions);
            } else {
                instructions = [body.instructions.trim()];
            }
        } else if (Array.isArray(body.instructions)) {
            instructions = body.instructions;
        }
    } catch (e) {
        instructions = [];
    }

    return {
        title: body.title,
        ingredients,
        instructions,
        difficulty: body.difficulty || "Easy",
        servings: String(body.servings || "1"),       // Schema: String?
        cookingTime: String(body.cookingTime || "0"), // Schema: String?
        status: body.status || "pending"
    };
};

// 1. CREATE RECIPE
export const createRecipe = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Please upload an image" });
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'recipes',
        });

        const parsed = parseRecipeData(req.body);

        const newRecipe = await prisma.recipe.create({
            data: {
                ...parsed,
                imageUrl: result.secure_url,
                authorId: req.user.id,
                ratings: [], // Initialize JSON field
                likedBy: [], // Initialize Int array
                status: "pending"
            }
        });

        const io = req.app.get('socketio');
        if (io) {
            const updatedPendingCount = await prisma.recipe.count({ where: { status: 'pending' } });
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

// 2. GET ALL RECIPES (Public Grid)
export const getAllRecipes = async (req, res) => {
    try {
        const recipes = await prisma.recipe.findMany({
            where: { status: 'approved' }, 
            include: { author: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(recipes);
    } catch (error) {
        res.status(500).json([]);
    }
};

// 3. GET RECIPE BY ID
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
        res.status(200).json(recipe);
    } catch (error) {
        res.status(404).json({ message: "Recipe not found" });
    }
}

// 4. UPDATE RECIPE (Edit)
export const updateRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const recipeId = parseInt(id);
        
        const existingRecipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
        if (!existingRecipe) return res.status(404).json({ error: "Recipe not found" });

        // Security: Only Author or Admin
        if (req.user.role !== 'admin' && existingRecipe.authorId !== req.user.id) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        const parsed = parseRecipeData(req.body);
        let updateData = { ...parsed };

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, { folder: 'recipes' });
            updateData.imageUrl = result.secure_url;
        }

        const updated = await prisma.recipe.update({
            where: { id: recipeId },
            data: updateData
        });

        if (req.body.status === 'approved') {
            const io = req.app.get('socketio');
            if (io) io.emit("recipeApproved", { title: updated.title });
        }

        res.json({ message: "Recipe updated successfully!", recipe: updated });
    } catch (error) {
        res.status(500).json({ error: "Update failed" });
    }
};

// 5. SEARCH RECIPES
export const searchRecipes = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);
        const results = await prisma.recipe.findMany({
            where: {
                title: { contains: q, mode: 'insensitive' },
                status: 'approved'
            },
            include: { author: { select: { name: true } } }
        });
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 6. TOGGLE LIKE
export const toggleLike = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;
        const recipe = await prisma.recipe.findUnique({ where: { id: parseInt(id) } });
        
        let likes = recipe.likedBy || [];
        const isAlreadyLiked = likes.includes(userId);
        likes = isAlreadyLiked ? likes.filter(i => i !== userId) : [...likes, userId];

        const updatedRecipe = await prisma.recipe.update({
            where: { id: parseInt(id) },
            data: { likedBy: likes }
        });

        res.json({ liked: !isAlreadyLiked, count: updatedRecipe.likedBy.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 7. GET POPULAR RECIPES
export const getPopularRecipes = async (req, res) => {
    try {
        const popularRecipes = await prisma.recipe.findMany({
            where: { status: 'approved' },
            take: 6,
            orderBy: { views: 'desc' },
            include: { author: { select: { name: true } } }
        });
        res.json(popularRecipes);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch popular recipes" });
    }
};

// 8. COMMENT LOGIC
export const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { text, userName } = req.body;
        const newComment = await prisma.comment.create({
            data: {
                text,
                userName: userName || "Anonymous Chef",
                recipeId: parseInt(id),
                userId: req.user.id
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
        const comment = await prisma.comment.findUnique({ where: { id: parseInt(id) } });
        
        if (comment.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized" });
        }

        const updated = await prisma.comment.update({
            where: { id: parseInt(id) },
            data: { text }
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: "Failed to update" });
    }
};

export const deleteComment = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: "Admin only" });
        await prisma.comment.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: "Deleted" });
    } catch (error) {
        res.status(500).json({ error: "Failed" });
    }
};

// 9. ADMIN PANEL LOGIC
export const getPendingCount = async (req, res) => {
    try {
        const count = await prisma.recipe.count({ where: { status: 'pending' } });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: "Error" });
    }
};

export const rejectRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminNote } = req.body;
        const updated = await prisma.recipe.update({
            where: { id: parseInt(id) },
            data: { status: 'rejected', adminNote }
        });

        const io = req.app.get('socketio');
        if (io) {
            io.emit("recipeRejected", { authorId: updated.authorId, title: updated.title, reason: adminNote });
            const count = await prisma.recipe.count({ where: { status: 'pending' } });
            io.emit("updatePendingCount", { count });
        }
        res.json({ message: "Rejected" });
    } catch (error) {
        res.status(500).json({ error: "Failed" });
    }
};

// 10. RATE RECIPE
export const rateRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, userId } = req.body;
        const recipe = await prisma.recipe.findUnique({ where: { id: parseInt(id) } });
        
        let currentRatings = Array.isArray(recipe.ratings) ? recipe.ratings : [];
        currentRatings = currentRatings.filter(r => r.userId !== userId);
        currentRatings.push({ userId, value: parseInt(rating) });

        const updated = await prisma.recipe.update({
            where: { id: parseInt(id) },
            data: { ratings: currentRatings }
        });
        res.json({ message: "Saved", ratings: updated.ratings });
    } catch (error) {
        res.status(500).json({ error: "Failed" });
    }
};

// 11. PERMANENT DELETE
export const deleteRecipe = async (req, res) => {
    try {
        const recipeId = parseInt(req.params.id);
        const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });

        if (req.user.role !== 'admin' && recipe.authorId !== req.user.id) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        await prisma.comment.deleteMany({ where: { recipeId } });
        await prisma.recipe.delete({ where: { id: recipeId } });

        const io = req.app.get('socketio');
        if (io) {
            const count = await prisma.recipe.count({ where: { status: 'pending' } });
            io.emit("updatePendingCount", { count });
        }
        res.json({ message: "Deleted forever" });
    } catch (error) {
        res.status(500).json({ error: "Delete failed" });
    }
};