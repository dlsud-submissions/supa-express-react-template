import { createClient } from '@supabase/supabase-js';
import { execSync, spawn } from 'child_process';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

// ---------------------------------------------------------------------------
// schema.js
//
// Interactive helper for applying the baseline database schema.
//
// What this script does:
//   1. Checks whether public.users already exists via the Supabase SDK.
//   2. If the schema exists, prompts whether to rebuild from scratch.
//   3. Prints the SQL files to apply in the Dashboard (or via the CLI).
//   4. Prompts whether to run the seed script immediately after.
//
// Source SQL files (apply in this order):
//   supabase/schema.sql
//   supabase/migrations/02_oauth_user_trigger.sql
//   supabase/migrations/fix_rls_infinite_recursion.sql
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolved paths to SQL files — used for validation and instructions
export const SCHEMA_SQL_PATH = path.resolve(
  __dirname,
  '../../../supabase/schema.sql'
);

export const MIGRATION_PATHS = [
  path.resolve(
    __dirname,
    '../../../supabase/migrations/02_oauth_user_trigger.sql'
  ),
  path.resolve(
    __dirname,
    '../../../supabase/migrations/fix_rls_infinite_recursion.sql'
  ),
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Prompts the user with a yes/no question and resolves to a boolean.
 * @param {string} question
 * @returns {Promise<boolean>}
 */
function confirm(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${question} (y/n): `, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'y');
    });
  });
}

/**
 * Validates that all SQL files this script references actually exist on disk.
 * Exits the process if any are missing.
 */
function validateSQLFiles() {
  const allPaths = [SCHEMA_SQL_PATH, ...MIGRATION_PATHS];

  for (const filePath of allPaths) {
    if (!fs.existsSync(filePath)) {
      console.error(`  ✗  SQL file not found: ${filePath}`);
      process.exit(1);
    }
  }

  console.log('  ✓  All SQL files found\n');
}

/**
 * Checks whether the schema already exists by querying public.users.
 * Uses the Supabase admin client — requires SUPABASE_URL and
 * SUPABASE_SERVICE_ROLE_KEY to be set in server/.env.
 * @returns {Promise<boolean>} true if the table exists, false if not.
 */
async function checkSchemaExists() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.warn(
      '  ⚠  SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — skipping existence check.\n'
    );
    return false;
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabaseAdmin.from('users').select('id').limit(1);

  // Any error other than "relation does not exist" is unexpected
  if (error) {
    const missing =
      error.message?.includes('relation') ||
      error.message?.includes('does not exist') ||
      error.code === '42P01';

    if (missing) return false;

    // Table exists but something else went wrong (RLS, network, etc.)
    console.warn(`  ⚠  Could not verify schema: ${error.message}\n`);
    return false;
  }

  return true;
}

/**
 * Checks whether the Supabase CLI is installed and available on PATH.
 * @returns {boolean}
 */
function isSupabaseCLIAvailable() {
  try {
    execSync('supabase --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Attempts to apply the schema via the Supabase CLI.
 * Requires the project to be linked (`supabase link --project-ref <ref>`).
 */
function applyViaCLI() {
  console.log('  Running: supabase db push\n');

  try {
    execSync('supabase db push', { stdio: 'inherit' });
    console.log('\n  ✓  Schema applied via Supabase CLI\n');
  } catch {
    console.error('\n  ✗  supabase db push failed.');
    console.error(
      '     Make sure your project is linked: supabase link --project-ref <ref>\n'
    );
    process.exit(1);
  }
}

/**
 * Prints manual Dashboard instructions for applying the SQL files.
 * @param {boolean} rebuild - Whether to include the DROP TABLE note.
 */
function printManualInstructions(rebuild = false) {
  const allPaths = [SCHEMA_SQL_PATH, ...MIGRATION_PATHS];

  console.log('  Apply the schema manually in the Supabase Dashboard:\n');
  console.log('  1. Go to your project → SQL Editor → New query');

  if (rebuild) {
    console.log(
      '  2. To rebuild from scratch, first run this DROP statement:\n'
    );
    console.log('     DROP TABLE IF EXISTS public.users CASCADE;');
    console.log('     DROP TYPE  IF EXISTS public.app_role CASCADE;\n');
    console.log('     Then apply each file below in order:\n');
  } else {
    console.log('  2. Apply each file below in order:\n');
  }

  allPaths.forEach((filePath, index) => {
    const relative = path.relative(
      path.resolve(__dirname, '../../..'),
      filePath
    );
    console.log(`     ${index + 1}. ${relative}`);
  });

  console.log('');
}

/**
 * Spawns seed.js as a child process with inherited stdio so its output
 * streams directly to the terminal.
 * @returns {Promise<void>}
 */
function runSeed() {
  return new Promise((resolve, reject) => {
    const seedPath = path.resolve(__dirname, 'seed.js');
    const child = spawn('node', [seedPath], { stdio: 'inherit' });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`seed.js exited with code ${code}`));
      }
    });
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function applySchema() {
  console.log('\n🗄️   Database schema setup\n');

  validateSQLFiles();

  const schemaExists = await checkSchemaExists();

  if (schemaExists) {
    console.log('  ✓  Schema already exists (public.users found)\n');

    const rebuild = await confirm(
      '  Rebuild from scratch? This will drop and reapply all tables'
    );

    if (!rebuild) {
      console.log('\n  Skipping schema rebuild.\n');
    } else {
      console.log('');

      if (isSupabaseCLIAvailable()) {
        applyViaCLI();
      } else {
        printManualInstructions(true);
      }
    }
  } else {
    console.log('  Schema not found — fresh setup needed.\n');

    if (isSupabaseCLIAvailable()) {
      applyViaCLI();
    } else {
      printManualInstructions(false);
    }
  }

  const seed = await confirm('  Run seed script now?');

  if (seed) {
    console.log('');
    await runSeed();
  } else {
    console.log('\n  Done. Run seed manually: npm run db:seed\n');
  }
}

applySchema().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
