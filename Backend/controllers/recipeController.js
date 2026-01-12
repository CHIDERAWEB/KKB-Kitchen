import { prisma } from '../config/db.js';
import { v2 as cloudinary } from 'cloudinary';

// 1. CREATE RECIPE (Maintained your logic)
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

        return res.status(201).json({ message: "Recipe created!", recipe: newRecipe });

    } catch (err) {
        console.error("Create Recipe Error:", err);
        return res.status(500).json({ error: "Server failed to process recipe" });
    }
};

// 2. GET ALL RECIPES
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

// 3. GET SINGLE RECIPE (UPDATED: Added view increment)
export const getRecipeById = async (req, res) => {
    try {
        const { id } = req.params;
        const recipeId = parseInt(id);

        if (isNaN(recipeId)) return res.status(400).json({ message: "Invalid ID format" });

        // This is the part that was missing! It increments views on every fetch
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

// 4. NEW: UPDATE RECIPE (For the Admin Edit Button)
export const updateRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const recipeId = parseInt(id);

        let updateData = { ...req.body };

        // If a new image is uploaded, handle Cloudinary
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
                status: updateData.status // Can change back to pending or approved
            }
        });

        res.json({ message: "Recipe updated successfully!", recipe: updated });
    } catch (error) {
        res.status(500).json({ error: "Update failed" });
    }
};

// 5. TOGGLE LIKE (Ensured consistency)
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

// ... Rest of your functions (getPopular, search, addComment, getPendingCount) remain exactly the same ...
// Just make sure to EXPORT the new updateRecipe function

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

export const searchRecipes = async (req, res) => {
    try {
        const { query } = req.query;
        const results = await prisma.recipe.findMany({
            where: {
                title: { contains: query, mode: 'insensitive' }
            },
            include: { author: { select: { name: true } } }
        });
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { text, userName } = req.body;
        const recipeId = parseInt(id);

        const newComment = await prisma.comment.create({
            data: {
                text,
                userName: userName || "Anonymous Chef",
                recipeId: recipeId,
                // Prisma automatically sets createdAt, but we ensure it's in the response
            }
        });

        // Return the full object so the frontend has the name and date immediately
        res.status(201).json(newComment);
    } catch (error) {
        console.error("Comment Error:", error);
        res.status(500).json({ message: "Could not post comment" });
    }
};

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

export const deleteComment = async (req, res) => {
    try {
        const { id } = req.params; // Comment ID
        const commentId = parseInt(id);
        const userId = req.user.id; // From your auth middleware
        const userRole = req.user.role;

        const comment = await prisma.comment.findUnique({ where: { id: commentId } });

        if (!comment) return res.status(404).json({ message: "Comment not found" });

        // Security: Only Admin or the Author can delete
        // Note: This assumes you store 'authorId' in your Comment model. 
        // If you only store 'userName', check against the name or allow Admin only.
        if (userRole !== 'admin') {
            return res.status(403).json({ message: "Not authorized to delete this" });
        }

        await prisma.comment.delete({ where: { id: commentId } });
        res.json({ message: "Comment deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete comment" });
    }
};