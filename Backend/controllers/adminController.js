import { prisma } from '../config/db.js';

// 1. GET ALL PENDING + STATS
export const getAdminData = async (req, res) => {
    try {
        console.log("Fetching admin stats and recipes...");

        // 1. Get counts for the stats cards
        const total = await prisma.recipe.count();
        const pendingCount = await prisma.recipe.count({ where: { status: 'pending' } });
        const approvedCount = await prisma.recipe.count({ where: { status: 'approved' } });

        // 2. Fetch the actual recipes that need approval
        const pendingRecipes = await prisma.recipe.findMany({
            where: { status: 'pending' },
            include: {
                author: {
                    select: { name: true, email: true } // This helps show who wrote it
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // 3. Send the single, final response
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

        // 1. Update the recipe status in Prisma
        const updatedRecipe = await prisma.recipe.update({
            where: { id: parseInt(id) },
            data: { status: 'approved' }
        });

        // 2. TRIGGER SOCKET NOTIFICATION
        // We get the 'socketio' instance that you (should) have attached to the 'app' object in server.js
        const io = req.app.get('socketio');

        if (io) {
            io.emit('recipeApproved', {
                id: updatedRecipe.id,
                title: updatedRecipe.title,
                message: "New masterpiece approved!"
            });
        }

        res.status(200).json({
            message: "Recipe approved! ✅",
            recipe: updatedRecipe
        });

    } catch (error) {
        console.error("Approve Error:", error);
        res.status(500).json({ error: "Failed to approve recipe" });
    }
};

// 3. DELETE RECIPE
export const deleteRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.recipe.delete({
            where: { id: parseInt(id) }
        });
        res.status(200).json({ message: "Deleted! 🗑️" });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ error: "Failed to delete" });
    }
};

// 4. UPDATE/EDIT (FIXED THE CRASHING BUGS HERE)
export const updateRecipeByAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, cookTime, servings, ingredients, instructions, adminNote } = req.body; // Added adminNote here

        const updated = await prisma.recipe.update({
            where: { id: parseInt(id) },
            data: {
                title,
                cookTime,
                servings,
                ingredients: Array.isArray(ingredients) ? ingredients : [ingredients],
                instructions: Array.isArray(instructions) ? instructions : [instructions],
                adminNote: adminNote || "" // Safety check
            }
        });
        // Removed the double res.status calls that were crashing the server
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
        res.status(200).json(users);
    } catch (error) {
        console.error("Get Users Error:", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
};

// 7. TOGGLE USER ROLE
export const toggleUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { role: role }
        });
        res.status(200).json({ message: `User is now a ${role}`, user: updatedUser });
    } catch (error) {
        console.error("Toggle Role Error:", error);
        res.status(500).json({ error: "Failed to update role" });
    }
};

