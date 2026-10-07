const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'schools_database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Could not connect to SQLite database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Initialize the tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS schools (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      password TEXT,
      created_at INTEGER
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS app_state (
      school_id TEXT PRIMARY KEY,
      data TEXT,
      updated_at INTEGER,
      FOREIGN KEY(school_id) REFERENCES schools(id)
    )
  `);
});

module.exports = db;
