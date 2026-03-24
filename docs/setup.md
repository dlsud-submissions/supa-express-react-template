# Environment Setup

> Complete guide to getting your local development environment ready.
> Based on [The Odin Project — Installing PostgreSQL](https://www.theodinproject.com/lessons/nodejs-installing-postgresql).

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Git](https://git-scm.com/)

---

## 1. Install PostgreSQL

### Windows — EDB Graphical Installer (Recommended)

The official installer sets up PostgreSQL, pgAdmin 4, and all CLI tools in one go — no terminal needed.

**Step 1 — Download**

Go to [postgresql.org/download/windows](https://www.postgresql.org/download/windows/) and click **Download the installer** under _Interactive installer by EDB_. Pick the latest version for **Windows x86-64**.

**Step 2 — Run the installer**

Double-click the downloaded `.exe` and follow the wizard:

| Screen                   | Action                                                                                                          |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Welcome                  | Click **Next**                                                                                                  |
| Installation Directory   | Leave default (`C:\Program Files\PostgreSQL\<version>`), click **Next**                                         |
| Select Components        | Keep all four: **PostgreSQL Server**, **pgAdmin 4**, **Stack Builder**, **Command Line Tools** — click **Next** |
| Data Directory           | Leave default, click **Next**                                                                                   |
| **Password**             | **Enter a password for the `postgres` superuser.** Write it down — it goes into your `.env`. Click **Next**     |
| Port                     | Leave `5432`, click **Next**                                                                                    |
| Locale                   | Leave default, click **Next**                                                                                   |
| Pre Installation Summary | Click **Next** to start the install                                                                             |
| Finish                   | Uncheck Stack Builder (not needed), click **Finish**                                                            |

> The `postgres` superuser password you set here is what goes directly into your `DATABASE_URL`. No extra role setup is required on Windows.

**Step 3 — Add PostgreSQL to PATH (optional but useful)**

Lets you run `psql` from any terminal.

1. Press `Win + S` → search **Edit the system environment variables** → open it
2. Click **Environment Variables**
3. Under **System variables**, select `Path` → click **Edit**
4. Click **New** and add: `C:\Program Files\PostgreSQL\<version>\bin`
   _(replace `<version>` with your installed version, e.g. `17`)_
5. Click **OK** on all dialogs, then open a new terminal and verify:

```bash
psql --version
```

**Step 4 — Open pgAdmin 4**

pgAdmin 4 was installed automatically. On first launch it asks for a **pgAdmin master password** — this is a local app password just for pgAdmin itself, separate from your PostgreSQL password. Set anything memorable.

In the left panel, expand **Servers → PostgreSQL**. It will prompt for the `postgres` password you set during installation. Check **Save Password** so you're not asked every time.

---

### macOS — Postgres.app

1. Download and install [Postgres.app](https://postgresapp.com/)
2. Open Postgres.app and click **Initialize**
3. Add CLI tools to your `$PATH`:

```bash
sudo mkdir -p /etc/paths.d &&
echo /Applications/Postgres.app/Contents/Versions/latest/bin | sudo tee /etc/paths.d/postgresapp
```

4. Restart your terminal, then verify:

```bash
which psql
# Expected: /Applications/Postgres.app/Contents/Versions/latest/bin/psql
```

> Postgres.app creates a role and database matching your macOS username automatically. No password needed for local dev — your `DATABASE_URL` can omit the password segment.

---

### Linux — apt

```bash
# Update the system
sudo apt update && sudo apt upgrade

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib libpq-dev

# Start the service
sudo systemctl start postgresql.service
```

**Create a role matching your system username:**

```bash
sudo -i -u postgres createuser --interactive
# Enter your Linux username as the role name, answer "y" for superuser

sudo -i -u postgres createdb <your_username>
```

**Set a password:**

```bash
psql
```

```sql
\password <your_username>

GRANT ALL PRIVILEGES ON DATABASE <your_username> TO <your_username>;

\q
```

Save it to your shell environment:

```bash
echo 'export DATABASE_PASSWORD="<your_password>"' >> ~/.bashrc
```

---

## 2. Create Your Databases

You need two databases — one for development, one for tests.

### Option A — pgAdmin 4 (easiest on Windows)

1. In the left panel expand **Servers → PostgreSQL → Databases**
2. Right-click **Databases** → **Create → Database**
3. Name it `main_db` → **Save**
4. Repeat for `test_db`

### Option B — psql

```bash
psql -U postgres        # Windows
# or just: psql         # macOS/Linux
```

```sql
CREATE DATABASE main_db;
CREATE DATABASE test_db;
\q
```

---

## 3. Configure `.env` Files

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

**`server/.env`:**

```env
NODE_ENV=development
SERVER_PORT=3000

# Windows — postgres superuser:
DATABASE_URL=postgresql://postgres:<your_postgres_password>@localhost:5432/main_db
TEST_DATABASE_URL=postgresql://postgres:<your_postgres_password>@localhost:5432/test_db

# macOS / Linux — your own role:
# DATABASE_URL=postgresql://<your_username>:<your_password>@localhost:5432/main_db
# TEST_DATABASE_URL=postgresql://<your_username>:<your_password>@localhost:5432/test_db

JWT_SECRET=replace_with_a_long_random_string_minimum_32_characters
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

**`client/.env`:**

```env
VITE_API_BASE_URL=http://localhost:3000
```

---

## 4. Pin pgAdmin 4 to Windows Startup

So pgAdmin is ready every time you log in:

1. Press `Win + R`, type `shell:startup`, press **Enter** — the Startup folder opens
2. Press `Win + S`, search **pgAdmin 4**, right-click → **Open file location**
3. Copy the pgAdmin 4 shortcut (`Ctrl + C`)
4. Paste it into the Startup folder you opened (`Ctrl + V`)

pgAdmin will now launch automatically on login. Its icon appears in the system tray — hover over it to see which port it's running on (usually `http://127.0.0.1:5050`).

---

## 5. Install Dependencies

```bash
# From the project root
npm run install:all
```

---

## 6. Initialize the Database

```bash
cd server

# Run migrations and generate Prisma client
npm run db:sync

# (Optional) Seed initial data
npm run db:seed
```

---

## 7. Start the App

```bash
# From the project root
npm run dev
```

Or in VS Code: **Terminal → Run Task → 🚀 Dev: Start All**

---

## Troubleshooting

| Problem                                            | Fix                                                                                                             |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| pgAdmin asks for a master password                 | This is a pgAdmin app password, not your PostgreSQL password. Set anything memorable and save it.               |
| `fe_sendauth: no password supplied`                | `DATABASE_URL` is missing the password — format: `postgresql://user:PASSWORD@localhost:5432/db`                 |
| `ECONNREFUSED` in server logs                      | PostgreSQL isn't running. Press `Win + R` → `services.msc` → start **postgresql-x64-\<version\>**               |
| `role does not exist`                              | Re-run `createuser` with your exact username (Linux/macOS)                                                      |
| `database does not exist`                          | Create via pgAdmin or `psql -c "CREATE DATABASE main_db;"`                                                      |
| `Invalid DATABASE_URL` from Prisma                 | URL must end with the DB name: `…@localhost:5432/main_db`                                                       |
| Port 5432 already in use                           | Another PostgreSQL instance is running — check Services, or change port during install and update `.env`        |
| pgAdmin shows "no password supplied" after restart | Right-click the server in pgAdmin → **Properties → Connection** → re-enter password and check **Save password** |
