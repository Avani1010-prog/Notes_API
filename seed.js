require("dotenv").config();
const { neon } = require("@neondatabase/serverless");

async function seed() {
  const sql = neon(process.env.DATABASE_URL);

  await sql`
    INSERT INTO notes (title, content) VALUES
    ('Shopping List', 'Milk, eggs, bread, butter, cheese, fruits, vegetables'),
    ('Meeting Notes - Q1 Review', 'Discussed revenue growth, customer acquisition, and upcoming product launches. Action items: finalize budget by Friday.'),
    ('Book Recommendations', '1. Atomic Habits by James Clear\n2. Deep Work by Cal Newport\n3. The Pragmatic Programmer'),
    ('Workout Plan', 'Monday: Chest & Triceps\nTuesday: Back & Biceps\nWednesday: Rest\nThursday: Legs\nFriday: Shoulders & Abs'),
    ('Recipe - Pasta Alfredo', 'Cook fettuccine. Make sauce with butter, cream, parmesan, garlic. Toss pasta in sauce. Top with parsley.'),
    ('Project Ideas', 'Build a weather dashboard, create a habit tracker app, design a portfolio website'),
    ('Travel Bucket List', 'Japan - Tokyo, Kyoto\nItaly - Rome, Venice\nNorway - Northern Lights\nNew Zealand - Milford Sound'),
    ('Study Notes - JavaScript', 'Closures, Promises, Async/Await, Event Loop, Prototypal Inheritance, ES6+ features')
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
