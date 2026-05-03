require("dotenv").config();
const express = require("express");
const sql = require("./db");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

async function authenticateApiKey(req, res, next) {
  const key = req.headers["x-api-key"];

  if (!key) {
    return res.status(401).json({ error: "Unauthorized. Missing x-api-key header." });
  }

  try {
    const users = await sql`SELECT id FROM users WHERE api_key = ${key}`;

    if (users.length === 0) {
      return res.status(401).json({ error: "Unauthorized. Invalid API key." });
    }

    req.userId = users[0].id;
    next();
  } catch (err) {
    console.error("Error authenticating API key:", err);
    res.status(500).json({ error: "Authentication failed." });
  }
}

app.get("/notes", authenticateApiKey, async (req, res) => {
  try {
    const notes = await sql`
      SELECT id, title, content, created_at, updated_at
      FROM notes
      WHERE user_id = ${req.userId}
      ORDER BY created_at DESC
    `;
    res.json(notes);
  } catch (err) {
    console.error("Error fetching notes:", err);
    res.status(500).json({ error: "Failed to fetch notes." });
  }
});

app.get("/notes/:id", authenticateApiKey, async (req, res) => {
  const { id } = req.params;

  try {
    const notes = await sql`
      SELECT id, title, content, created_at, updated_at
      FROM notes
      WHERE id = ${id} AND user_id = ${req.userId}
    `;

    if (notes.length === 0) {
      return res.status(404).json({ error: "Note not found." });
    }

    res.json(notes[0]);
  } catch (err) {
    console.error("Error fetching note:", err);
    res.status(500).json({ error: "Failed to fetch note." });
  }
});

app.post("/notes", authenticateApiKey, async (req, res) => {
  const { title, content } = req.body;

  if (!title || typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "Title is required and must be a non-empty string." });
  }

  const sanitizedContent = typeof content === "string" ? content : "";

  try {
    const rows = await sql`
      INSERT INTO notes (user_id, title, content)
      VALUES (${req.userId}, ${title.trim()}, ${sanitizedContent})
      RETURNING id, title, content, created_at, updated_at
    `;

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error creating note:", err);
    res.status(500).json({ error: "Failed to create note." });
  }
});

app.put("/notes/:id", authenticateApiKey, async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  if (title !== undefined && (typeof title !== "string" || title.trim() === "")) {
    return res.status(400).json({ error: "Title must be a non-empty string." });
  }

  try {
    const existing = await sql`
      SELECT id FROM notes
      WHERE id = ${id} AND user_id = ${req.userId}
    `;

    if (existing.length === 0) {
      return res.status(404).json({ error: "Note not found." });
    }

    const newTitle = title !== undefined ? title.trim() : undefined;
    const newContent = content !== undefined && typeof content === "string" ? content : undefined;

    let updated;

    if (newTitle !== undefined && newContent !== undefined) {
      [updated] = await sql`
        UPDATE notes SET title = ${newTitle}, content = ${newContent}, updated_at = NOW()
        WHERE id = ${id} AND user_id = ${req.userId}
        RETURNING id, title, content, created_at, updated_at
      `;
    } else if (newTitle !== undefined) {
      [updated] = await sql`
        UPDATE notes SET title = ${newTitle}, updated_at = NOW()
        WHERE id = ${id} AND user_id = ${req.userId}
        RETURNING id, title, content, created_at, updated_at
      `;
    } else if (newContent !== undefined) {
      [updated] = await sql`
        UPDATE notes SET content = ${newContent}, updated_at = NOW()
        WHERE id = ${id} AND user_id = ${req.userId}
        RETURNING id, title, content, created_at, updated_at
      `;
    } else {
      return res.status(400).json({ error: "Provide at least one field to update: title or content." });
    }

    res.json(updated);
  } catch (err) {
    console.error("Error updating note:", err);
    res.status(500).json({ error: "Failed to update note." });
  }
});

app.delete("/notes/:id", authenticateApiKey, async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await sql`
      DELETE FROM notes
      WHERE id = ${id} AND user_id = ${req.userId}
      RETURNING id
    `;

    if (deleted.length === 0) {
      return res.status(404).json({ error: "Note not found." });
    }

    res.json({ message: "Note deleted successfully." });
  } catch (err) {
    console.error("Error deleting note:", err);
    res.status(500).json({ error: "Failed to delete note." });
  }
});

app.listen(PORT, () => {
  console.log(`Notes API running on port ${PORT}`);
});
