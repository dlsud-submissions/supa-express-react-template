import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/index.js';
import pool from '../src/db/pool.js';
import bcrypt from 'bcryptjs';

/**
 * Executes the database seeding routine.
 * - Purges existing user records to ensure a clean state.
 * - Hashes a default password for all seed accounts.
 * - Injects standard and administrative test accounts into the PostgreSQL database.
 * @async
 * @returns {Promise<void>}
 */
async function main() {
  // Initialize Prisma using the shared database pool adapter
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('--- Database Seeding Started ---');

  // Clear stale data from the user table
  await prisma.user.deleteMany({});

  // Generate secure hash for the default seed password
  const hashedPassword = await bcrypt.hash('testpass123', 10);

  // Define initial account dataset
  const seedUsers = [
    { username: 'Bryan', password: hashedPassword, role: 'USER' },
    { username: 'Odin', password: hashedPassword, role: 'ADMIN' },
    { username: 'Damon', password: hashedPassword, role: 'USER' },
    { username: 'Boss', password: hashedPassword, role: 'SUPER_ADMIN' },
  ];

  // Persist each user and log result
  for (const user of seedUsers) {
    const createdUser = await prisma.user.create({ data: user });
    console.log(`+ Created ${createdUser.role}: ${createdUser.username}`);
  }

  console.log('--- Seed Completed Successfully! ---');

  // Terminate Prisma connection
  await prisma.$disconnect();
}

// Script execution lifecycle
main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Shutdown the pg pool to allow the Node process to exit cleanly
    await pool.end();
  });
