import { prisma } from '../config/db.js';

// 1. GET ALL PENDING + STATS
export const getAdminData = async (req, res) => {
    try {
        console.log("Fetching admin stats and recipes...");

        // Optimized: Fetch counts and recipes in parallel to speed up dashboard load
        const [total, pendingCount, approvedCount, pendingRecipes] = await Promise.all([
            prisma.recipe.count(),
            prisma.recipe.count({ where: { status: 'pending' } }),
            prisma.recipe.count({ where: { status: 'approved' } }),
            prisma.recipe.findMany({
                where: { status: 'pending' },
                include: {
                    author: {
                        select: { name: true, email: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            })
        ]);

        return res.status(200).json({
            stats: {
                total,
                pending: pendingCount,
                approved: approvedCount
            },
            pendingRecipes: pendingRecipes || []
        });

    } catch (error) {
        console.error("Admin Data Error:", error);
        return res.status(500).json({ error: "Failed to fetch admin data" });
    }
};

// 2. APPROVE RECIPE
export const approveRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(id)) return res.status(400).json({ error: "Invalid recipe ID" });

        const updatedRecipe = await prisma.recipe.update({
            where: { id: parseInt(id) },
            data: { status: 'approved' }
        });

        // TRIGGER SOCKET NOTIFICATION
        const io = req.app.get('socketio');
        if (io) {
            io.emit('recipeApproved', {
                id: updatedRecipe.id,
                title: updatedRecipe.title,
                message: "New masterpiece approved!"
            });
        }

        return res.status(200).json({
            message: "Recipe approved! ✅",
            recipe: updatedRecipe
        });

    } catch (error) {
        console.error("Approve Error:", error);
        return res.status(500).json({ error: "Failed to approve recipe" });
    }
};

// 3. DELETE RECIPE (Rejection)
// Change deleteRecipe to rejectRecipe
export const rejectRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body; // This is the "statement" you wrote

        if (!id || isNaN(id)) return res.status(400).json({ error: "Invalid recipe ID" });

        const updated = await prisma.recipe.update({
            where: { id: parseInt(id) },
            data: { 
                status: 'rejected',
                adminNote: reason || "No reason provided by admin." 
            }
        });

        // Optional: Notify the user via Socket if they are online
        const io = req.app.get('socketio');
        if (io) {
            io.emit('recipeRejected', {
                recipeId: updated.id,
                authorId: updated.authorId,
                reason: reason
            });
        }

        return res.status(200).json({ message: "Recipe rejected and feedback sent! 📩" });
    } catch (error) {
        console.error("Reject Error:", error);
        return res.status(500).json({ error: "Failed to process rejection" });
    }
};
// 4. UPDATE/EDIT
export const updateRecipeByAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(id)) return res.status(400).json({ error: "Invalid recipe ID" });

        const { title, cookTime, servings, ingredients, instructions, adminNote } = req.body;

        const updated = await prisma.recipe.update({
            where: { id: parseInt(id) },
            data: {
                title,
                cookTime,
                servings,
                ingredients: Array.isArray(ingredients) ? ingredients : [ingredients],
                instructions: Array.isArray(instructions) ? instructions : [instructions],
                adminNote: adminNote || "" 
            }
        });

        return res.status(200).json({ message: "Changes saved! 📝", recipe: updated });
    } catch (error) {
        console.error("Update Error:", error);
        return res.status(500).json({ error: "Failed to save admin changes" });
    }
};

// 6. GET ALL USERS
export const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, createdAt: true },
            orderBy: { createdAt: 'desc' }
        });
        return res.status(200).json(users);
    } catch (error) {
        console.error("Get Users Error:", error);
        return res.status(500).json({ error: "Failed to fetch users" });
    }
};

// 7. TOGGLE USER ROLE
export const toggleUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        if (!id || isNaN(id)) return res.status(400).json({ error: "Invalid user ID" });

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { role: role }
        });

        return res.status(200).json({ message: `User is now a ${role}`, user: updatedUser });
    } catch (error) {
        console.error("Toggle Role Error:", error);
        return res.status(500).json({ error: "Failed to update role" });
    }
};