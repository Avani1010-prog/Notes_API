require("dotenv").config();
const { neon } = require("@neondatabase/serverless");

async function seed() {
  const sql = neon(process.env.DATABASE_URL);

  const [user] = await sql`
    INSERT INTO users (api_key)
    VALUES (${process.env.API_KEY})
    ON CONFLICT (api_key) DO NOTHING
    RETURNING id
  `;

  const existingUser = user || (await sql`SELECT id FROM users WHERE api_key = ${process.env.API_KEY}`)[0];

  await sql`
    INSERT INTO notes (user_id, title, content) VALUES
    (${existingUser.id}, 'Shopping List', 'Milk, eggs, bread, butter, cheese, fruits, vegetables'),
    (${existingUser.id}, 'Meeting Notes - Q1 Review', 'Discussed revenue growth, customer acquisition, and upcoming product launches. Action items: finalize budget by Friday.'),
    (${existingUser.id}, 'Book Recommendations', '1. Atomic Habits by James Clear\n2. Deep Work by Cal Newport\n3. The Pragmatic Programmer'),
    (${existingUser.id}, 'Workout Plan', 'Monday: Chest & Triceps\nTuesday: Back & Biceps\nWednesday: Rest\nThursday: Legs\nFriday: Shoulders & Abs'),
    (${existingUser.id}, 'Recipe - Pasta Alfredo', 'Cook fettuccine. Make sauce with butter, cream, parmesan, garlic. Toss pasta in sauce. Top with parsley.'),
    (${existingUser.id}, 'Project Ideas', 'Build a weather dashboard, create a habit tracker app, design a portfolio website'),
    (${existingUser.id}, 'Travel Bucket List', 'Japan - Tokyo, Kyoto\nItaly - Rome, Venice\nNorway - Northern Lights\nNew Zealand - Milford Sound'),
    (${existingUser.id}, 'Study Notes - JavaScript', 'Closures, Promises, Async/Await, Event Loop, Prototypal Inheritance, ES6+ features')
  `;

  console.log("Seed data inserted successfully!");

  const notes = await sql`SELECT COUNT(*) as count FROM notes`;
  console.log(`Total notes in database: ${notes[0].count}`);

  process.exit(0);
}

seed().catch((err) => {
  console.error("Failed to seed database:", err);
  process.exit(1);
});
