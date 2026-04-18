import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error(
    'Missing Supabase environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.'
  );
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/**
 * Seed users definition.
 * - Username is stored in user_metadata so the handle_new_user trigger
 *   can read it and populate public.users on INSERT.
 * - Roles are set via a follow-up UPDATE after the auth user is created,
 *   because the trigger always inserts with the default role of 'USER'.
 */
const SEED_USERS = [
  { username: 'Bryan', password: 'testpass123', role: 'USER' },
  { username: 'Odin', password: 'testpass123', role: 'ADMIN' },
  { username: 'Damon', password: 'testpass123', role: 'USER' },
  { username: 'Boss', password: 'testpass123', role: 'SUPER_ADMIN' },
];

/**
 * Creates a Supabase auth user and waits for the DB trigger to insert
 * the corresponding public.users row.
 * @param {{ username: string, password: string, role: string }} seedUser
 * @returns {Promise<string|null>} The created user's UUID, or null on failure.
 */
async function createAuthUser({ username, password }) {
  const email = `${username.toLowerCase()}@app.local`;

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username },
  });

  if (error) {
    // Treat "already exists" as non-fatal — user may have been seeded before
    if (error.message?.toLowerCase().includes('already registered')) {
      console.log(`  ⚠  ${username} already exists — skipping creation`);

      // Resolve the existing user's ID so role can still be patched
      const { data: existing } = await supabaseAdmin.auth.admin.listUsers();
      const match = existing?.users?.find((u) => u.email === email);
      return match?.id ?? null;
    }

    console.error(`  ✗  Failed to create ${username}:`, error.message);
    return null;
  }

  console.log(`  ✓  Created auth user: ${username} (${data.user.id})`);
  return data.user.id;
}

/**
 * Updates the role on the public.users row that the DB trigger created.
 * No-op for 'USER' since that is the trigger's default.
 * @param {string} userId
 * @param {string} username
 * @param {string} role
 */
async function patchRole(userId, username, role) {
  if (role === 'USER') return; // Default — no patch needed

  const { error } = await supabaseAdmin
    .from('users')
    .update({ role })
    .eq('id', userId);

  if (error) {
    console.error(
      `  ✗  Failed to set ${username} role to ${role}:`,
      error.message
    );
  } else {
    console.log(`  ✓  Set ${username} role → ${role}`);
  }
}

/**
 * Main seed runner.
 */
async function seed() {
  console.log('\n🌱  Seeding Supabase users...\n');

  for (const seedUser of SEED_USERS) {
    console.log(`→  ${seedUser.username} (${seedUser.role})`);
    const userId = await createAuthUser(seedUser);
    if (userId) {
      await patchRole(userId, seedUser.username, seedUser.role);
    }
  }

  console.log('\n✅  Seed complete.\n');
}

seed().catch((err) => {
  console.error('Unexpected seed error:', err);
  process.exit(1);
});
