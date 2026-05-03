require("dotenv").config();
const { neon } = require("@neondatabase/serverless");

async function init() {
  const sql = neon(process.env.DATABASE_URL);

  await sql`
    CREATE TABLE IF NOT EXISTS notes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  console.log("Database initialized successfully.");
  process.exit(0);
}

init().catch((err) => {
  console.error("Failed to initialize database:", err);
  process.exit(1);
});
