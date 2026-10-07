const express = require('express');
const cors = require('cors');
const db = require('./db');
const crypto = require('crypto');
const path = require('path');

const app = express();
app.use(cors());
// Need to increase payload limit as the entire appState JSON could be several megabytes
app.use(express.json({ limit: '50mb' }));
// Serve the admin dashboard from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// --- MONITORING STATE ---
const serverStartTime = Date.now();
const syncLogs = [];
const addLog = (type, message, schoolId = null) => {
  syncLogs.unshift({ type, message, schoolId, timestamp: Date.now() });
  if (syncLogs.length > 100) syncLogs.pop();
};

// Helper to generate unique IDs
const generateId = () => crypto.randomBytes(16).toString('hex');

// --- AUTHENTICATION ---

app.post('/api/auth/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const id = generateId();
  const now = Date.now();

  db.run(`INSERT INTO schools (id, email, password, created_at) VALUES (?, ?, ?, ?)`, [id, email, password, now], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'auth/email-already-in-use' });
      }
      addLog('auth_error', `Registration failed: ${err.message}`, id);
      return res.status(500).json({ error: err.message });
    }
    addLog('auth', `New school registered: ${email}`, id);
    res.status(201).json({ user: { uid: id, email } });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  db.get(`SELECT id, email, password FROM schools WHERE email = ?`, [email], (err, row) => {
    if (err) {
      addLog('auth_error', `Login error: ${err.message}`);
      return res.status(500).json({ error: err.message });
    }
    if (!row || row.password !== password) {
      addLog('auth_error', `Failed login attempt for: ${email}`);
      return res.status(401).json({ error: 'auth/invalid-credential' });
    }
    addLog('auth', `School logged in`, row.id);
    res.json({ user: { uid: row.id, email: row.email } });
  });
});

// --- DATA SYNC ---

app.post('/api/sync/:schoolId', (req, res) => {
  const { schoolId } = req.params;
  const payload = req.body;
  const now = Date.now();

  // Store the JSON object as a string
  const dataString = JSON.stringify(payload);

  db.run(
    `INSERT INTO app_state (school_id, data, updated_at) 
     VALUES (?, ?, ?) 
     ON CONFLICT(school_id) 
     DO UPDATE SET data=excluded.data, updated_at=excluded.updated_at`,
    [schoolId, dataString, now],
    function(err) {
      if (err) {
        addLog('sync_error', `Sync POST failed: ${err.message}`, schoolId);
        return res.status(500).json({ error: err.message });
      }
      addLog('sync', `Data pushed from client (${Buffer.byteLength(dataString, 'utf8')} bytes)`, schoolId);
      res.json({ success: true, updated_at: now });
    }
  );
});

app.get('/api/sync/:schoolId', (req, res) => {
  const { schoolId } = req.params;

  db.get(`SELECT data FROM app_state WHERE school_id = ?`, [schoolId], (err, row) => {
    if (err) {
      addLog('sync_error', `Sync GET failed: ${err.message}`, schoolId);
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      addLog('sync', `Client requested data (empty)`, schoolId);
      return res.json({ data: {} });
    }
    
    try {
      const parsed = JSON.parse(row.data);
      addLog('sync', `Data pulled by client`, schoolId);
      res.json({ data: parsed });
    } catch (e) {
      addLog('sync_error', `Failed to parse stored data for client`, schoolId);
      res.status(500).json({ error: 'Failed to parse stored data' });
    }
  });
});

// --- ADMIN DASHBOARD ---

app.get('/api/admin/stats', (req, res) => {
  db.get(`SELECT COUNT(*) as count FROM schools`, (err, row) => {
    const schoolCount = row ? row.count : 0;
    
    db.get(`SELECT COUNT(*) as count FROM app_state`, (err2, row2) => {
      const dbSize = row2 ? row2.count : 0; // rough proxy for db size
      
      res.json({
        uptime: Date.now() - serverStartTime,
        schoolCount,
        dbSize,
        recentLogs: syncLogs
      });
    });
  });
});

// Start the server
const PORT = process.env.PORT || 5555;
app.listen(PORT, () => {
  console.log(`OTEC Custom Server running on http://localhost:${PORT}`);
});
