import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApiApp } from './server/app.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export { createApiApp };

function resolvePort(): number {
  const portFlagIndex = process.argv.indexOf('--port');
  if (portFlagIndex !== -1 && process.argv[portFlagIndex + 1]) {
    const cliPort = Number(process.argv[portFlagIndex + 1]);
    if (Number.isFinite(cliPort) && cliPort > 0) {
      return cliPort;
    }
  }
  if (process.env.DEFAULT_APP_PORT) {
    const defaultAppPort = Number(process.env.DEFAULT_APP_PORT);
    if (Number.isFinite(defaultAppPort) && defaultAppPort > 0) {
      return defaultAppPort;
    }
  }
  const envPort = Number(process.env.PORT);
  if (
    Number.isFinite(envPort) &&
    envPort > 0 &&
    String(envPort) !== process.env.NGINX_PORT
  ) {
    return envPort;
  }
  return 3000;
}

async function startServer() {
  const app = createApiApp();
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const port = resolvePort();
  app.listen(port, '0.0.0.0', () => {
    console.log(`Restaurante Viva Luanda server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
