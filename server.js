import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

// Serve static assets from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Check if an optional local audio file exists in public/audio/
app.get('/api/audio-source', (req, res) => {
  const candidates = ['saturn.mp3', 'saturn.m4a', 'saturn.ogg', 'saturn.wav'];
  const audioDir = path.join(__dirname, 'public', 'audio');
  let localUrl = null;
  for (const name of candidates) {
    if (fs.existsSync(path.join(audioDir, name))) {
      localUrl = `/audio/${name}`;
      break;
    }
  }
  res.json({ localUrl });
});

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
