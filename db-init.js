require("dotenv").config();
const { neon } = require("@neondatabase/serverless");

async function init() {
  const sql = neon(process.env.DATABASE_URL);

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      api_key TEXT UNIQUE NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS notes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  try {
    await sql`ALTER TABLE notes ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE`;
    console.log("Added user_id column to existing notes table.");
  } catch {
    console.log("user_id column already exists or could not be added.");
  }

  console.log("Database initialized successfully.");
  process.exit(0);
}

init().catch((err) => {
  console.error("Failed to initialize database:", err);
  process.exit(1);
});
