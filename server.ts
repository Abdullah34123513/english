// server.ts - Next.js Standalone Server with Socket.IO
import { createServer } from 'http';
import next from 'next';
import 'dotenv/config';
import { initializeSocketServer, attachSocketServer } from './src/lib/socket-server';

const dev = process.env.NODE_ENV !== 'production';
const currentPort = 3000;
const hostname = '0.0.0.0';

// Custom server with Socket.IO integration
async function createCustomServer() {
  try {
    // Create Next.js app
    const nextApp = next({ 
      dev,
      dir: process.cwd(),
      // In production, use the current directory where .next is located
      conf: dev ? undefined : { distDir: './.next' }
    });

    await nextApp.prepare();
    const handle = nextApp.getRequestHandler();

    // Create HTTP server
    const server = createServer(handle);

    // Initialize Socket.IO server
    initializeSocketServer();
    
    // Attach Socket.IO to the HTTP server
    attachSocketServer(server);

    // Start the server
    server.listen(currentPort, hostname, () => {
      console.log(`> Ready on http://${hostname}:${currentPort}`);
      console.log(`> Socket.IO server initialized`);
    });

  } catch (err) {
    console.error('Server startup error:', err);
    process.exit(1);
  }
}

// Start the server
createCustomServer();