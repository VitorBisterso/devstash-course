import "dotenv/config";
import { PrismaClient } from "@/generated/prisma/client/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

async function testDatabase() {
  console.log("Testing database connection...");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const userCount = await prisma.user.count();
    console.log(`Database connection successful! Found ${userCount} user(s).`);

    const itemCount = await prisma.item.count();
    console.log(`Found ${itemCount} item(s).`);

    const collectionCount = await prisma.collection.count();
    console.log(`Found ${collectionCount} collection(s).`);

    console.log("Database test completed successfully!");
  } catch (error) {
    console.error("Database test failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

testDatabase();