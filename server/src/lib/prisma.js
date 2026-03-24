import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/index.js';
import pool from '../db/pool.js';

/**
 * Shared PrismaClient instance.
 * - Utilizes the @prisma/adapter-pg to connect via an existing pg pool.
 * - Maintains connection efficiency by reusing the node-postgres pool.
 * @type {PrismaClient}
 */

// Wrap pg pool in Prisma adapter
const adapter = new PrismaPg(pool);

// Initialize client with adapter
const prisma = new PrismaClient({ adapter });

export { prisma };
