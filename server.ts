import express, { type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';
const isProd = process.env.NODE_ENV === 'production';

// Check if an optional local audio file exists in public/audio/
app.get('/api/audio-source', (_req: Request, res: Response) => {
  const candidates = ['saturn.mp3', 'saturn.m4a', 'saturn.ogg', 'saturn.wav'];
  const audioDir = path.join(__dirname, 'public', 'audio');
  let localUrl: string | null = null;
  for (const name of candidates) {
    if (fs.existsSync(path.join(audioDir, name))) {
      localUrl = `/audio/${name}`;
      break;
    }
  }
  res.json({ localUrl });
});

async function startServer(): Promise<void> {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
