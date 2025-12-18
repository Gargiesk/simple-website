const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the project directory so the HTML can be loaded from http://localhost:3000/simple_website.html
app.use(express.static(path.join(__dirname)));

// Basic CORS header for development if needed (you can tighten this in production)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

const DATA_FILE = path.join(__dirname, 'messages.json');

function saveMessage(msg) {
  let arr = [];
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf8') || '[]';
      arr = JSON.parse(raw);
    } catch (e) {
      arr = [];
    }
  }
  arr.push(Object.assign({ receivedAt: new Date().toISOString() }, msg));
  fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2), 'utf8');
}

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body || {};
  if (!email || !message) {
    return res.status(400).json({ ok: false, error: 'Missing required fields (email and message).' });
  }

  try {
    saveMessage({ name: name || '', email, message });
    return res.json({ ok: true });
  } catch (err) {
    console.error('Failed to save message:', err);
    return res.status(500).json({ ok: false, error: 'Failed to save message.' });
  }
});

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
