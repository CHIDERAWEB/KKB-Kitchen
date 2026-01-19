import { prisma } from '../config/db.js';

/**
 * 1. GET ALL PENDING + STATS
 * Fetches dashboard statistics and the list of recipes awaiting review.
 */
export const getAdminData = async (req, res) => {
    try {
        const [total, pendingCount, approvedCount, pendingRecipes] = await Promise.all([
            prisma.recipe.count(),
            prisma.recipe.count({ where: { status: 'pending' } }),
            prisma.recipe.count({ where: { status: 'approved' } }),
            prisma.recipe.findMany({
                where: { status: 'pending' },
                include: {
                    author: {
                        select: { id: true, name: true, email: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            })
        ]);

        return res.status(200).json({
            total,
            pending: pendingCount,
            approved: approvedCount,
            pendingRecipes: pendingRecipes || []
        });

    } catch (error) {
        console.error("Admin Data Error:", error);
        return res.status(500).json({ error: "Failed to fetch admin dashboard data" });
    }
};

/**
 * 2. APPROVE RECIPE
 * Moves recipe to 'approved' status and notifies the author via Socket.io.
 */
export const approveRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(id)) return res.status(400).json({ error: "Invalid recipe ID" });

        const updatedRecipe = await prisma.recipe.update({
            where: { id: parseInt(id) },
            data: { status: 'approved' }
        });

        // Emit real-time notification to the author's private room
        const io = req.app.get('socketio');
        if (io) {
            io.to(updatedRecipe.authorId.toString()).emit('recipe_update', {
                type: 'APPROVED',
                title: updatedRecipe.title,
                message: "Your recipe has been approved and is now live!"
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

/**
 * 3. REJECT RECIPE
 * Sets status to 'rejected', saves the admin feedback, and notifies the author.
 */
export const rejectRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminNote } = req.body; 

        if (!id || isNaN(id)) return res.status(400).json({ error: "Invalid recipe ID" });

        const updated = await prisma.recipe.update({
            where: { id: parseInt(id) },
            data: { 
                status: 'rejected',
                adminNote: adminNote || "No reason provided by admin." 
            }
        });

        const io = req.app.get('socketio');
        if (io) {
            // MATCHING YOUR SERVER: Sending to the room named exactly by the ID string
            io.to(updated.authorId.toString()).emit('recipe_update', {
                type: 'REJECTED',
                title: updated.title,
                message: adminNote || "No reason provided."
            });

            // Update pending count for admins
            const pendingCount = await prisma.recipe.count({ where: { status: 'pending' } });
            io.emit('updatePendingCount', { count: pendingCount });
        }

        return res.status(200).json({ message: "Recipe rejected and feedback sent! 📩" });
    } catch (error) {
        console.error("Reject Error:", error);
        return res.status(500).json({ error: "Failed to process rejection" });
    }
};

/**
 * 4. UPDATE/EDIT BY ADMIN
 * Allows admins to fix typos or adjust recipe details directly.
 */
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

/**
 * 5. GET ALL USERS
 * Provides data for the User Management / Staff tab.
 */
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

/**
 * 6. TOGGLE USER ROLE
 * Updates user permissions (e.g., promoting a User to Admin).
 */
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

/**
 * 7. GET PENDING COUNT
 * Simple helper for notification badges on the admin icon.
 */
export const getPendingCount = async (req, res) => {
    try {
        const count = await prisma.recipe.count({
            where: { status: 'pending' }
        });
        return res.status(200).json({ count });
    } catch (error) {
        console.error("Count Error:", error);
        return res.status(500).json({ error: "Failed to fetch pending count" });
    }
};