import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;

// 1. Setup the connection pool with SSL (Necessary for Cloud/Official hosting)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// 2. Setup the adapter
const adapter = new PrismaPg(pool);

// 3. Initialize Prisma Client
export const prisma = new PrismaClient({ adapter });

export const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log("✅ Database connected Successfully to the Cloud!");
    } catch (error) {
        console.error("❌ Connection failed:", error);
        process.exit(1);
    }
};