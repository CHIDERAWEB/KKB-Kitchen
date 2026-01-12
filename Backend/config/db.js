import prismaPkg from '@prisma/client';
const { PrismaClient } = prismaPkg;

import { PrismaPg } from '@prisma/adapter-pg';
import pgPkg from 'pg';
const { Pool } = pgPkg;

// 1. Setup the connection pool with SSL (Necessary for Cloud hosting)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// 2. Setup the adapter
const adapter = new PrismaPg(pool);

// 3. Initialize Prisma Client
export const prisma = new PrismaClient({ adapter });

// 4. Connection check function
export const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log("✅ Database connected Successfully to the Cloud!");
    } catch (error) {
        console.error("❌ Connection failed:", error);
        process.exit(1);
    }
};