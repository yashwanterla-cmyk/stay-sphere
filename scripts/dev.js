const { spawn, exec, execSync } = require('child_process');
const http = require('http');
const net = require('net');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const FRONTEND_DIR = path.join(ROOT, 'frontend');
const BACKEND_DIR = path.join(ROOT, 'backend');

// Detect virtualenv Python executable
let pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
const venvPythonWin = path.join(ROOT, '.venv', 'Scripts', 'python.exe');
const venvPythonUnix = path.join(ROOT, '.venv', 'bin', 'python');
if (process.platform === 'win32' && fs.existsSync(venvPythonWin)) {
  pythonCmd = venvPythonWin;
} else if (process.platform !== 'win32' && fs.existsSync(venvPythonUnix)) {
  pythonCmd = venvPythonUnix;
}

// Try to free the specified port by killing the process holding it
function freePort(port) {
  return new Promise((resolve) => {
    if (process.platform === 'win32') {
      exec(`netstat -ano`, (err, stdout) => {
        if (err || !stdout) return resolve();
        const lines = stdout.split('\n');
        const pids = new Set();
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 5) {
            const localAddress = parts[1];
            // Ensure we match the port exactly (e.g. :5173, not :51730)
            if (localAddress.endsWith(`:${port}`)) {
              const pid = parts[parts.length - 1];
              if (pid && pid !== '0' && !isNaN(pid)) {
                pids.add(parseInt(pid));
              }
            }
          }
        }
        if (pids.size === 0) return resolve();
        console.log(`Port ${port} is in use by PID(s): ${Array.from(pids).join(', ')}. Attempting to free...`);
        let killedCount = 0;
        const pidArray = Array.from(pids);
        for (const pid of pidArray) {
          exec(`taskkill /F /T /PID ${pid}`, (killErr) => {
            if (killErr) {
              console.warn(`[Warning] Failed to taskkill PID ${pid}:`, killErr.message);
            } else {
              console.log(`Successfully killed PID ${pid} tree.`);
            }
            killedCount++;
            if (killedCount === pidArray.length) {
              // Wait slightly for socket to release
              setTimeout(resolve, 1000);
            }
          });
        }
      });
    } else {
      exec(`lsof -t -i:${port}`, (err, stdout) => {
        if (err || !stdout) return resolve();
        const pids = stdout.trim().split('\n').map(p => p.trim()).filter(Boolean);
        if (pids.length === 0) return resolve();
        console.log(`Port ${port} is in use by PID(s): ${pids.join(', ')}. Attempting to free...`);
        let killedCount = 0;
        for (const pid of pids) {
          exec(`kill -9 ${pid}`, (killErr) => {
            if (killErr) {
              // Fallback to fuser if kill failed
              exec(`fuser -k ${port}/tcp`, () => {});
            }
            killedCount++;
            if (killedCount === pids.length) {
              setTimeout(resolve, 1000);
            }
          });
        }
      });
    }
  });
}

// Find a free port starting from startPort
function findFreePort(startPort, maxPort = startPort + 50) {
  return new Promise((resolve, reject) => {
    let port = startPort;
    (function tryPort() {
      const server = net.createServer();
      server.once('error', (err) => {
        server.close();
        if (err.code === 'EADDRINUSE') {
          port++;
          if (port > maxPort) return reject(new Error('No free port found'));
          return tryPort();
        }
        reject(err);
      });
      server.once('listening', () => {
        server.close(() => resolve(port));
      });
      server.listen(port, '127.0.0.1');
    })();
  });
}

// Wait for a URL to return a success response
function waitForUrl(url, timeout = 30000, interval = 500) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    (function attempt() {
      const req = http.get(url, (res) => {
        res.destroy();
        resolve(true);
      });
      req.on('error', () => {
        if (Date.now() - start > timeout) return reject(new Error('Timeout waiting for ' + url));
        setTimeout(attempt, interval);
      });
      req.setTimeout(2000, () => req.abort());
    })();
  });
}

// Spawn child process with custom environment variables merged and proper shell handling
function spawnProcess(command, args, options = {}) {
  const env = Object.assign({}, process.env, options.env || {});
  
  // On Windows, commands ending in .cmd/npm must be run with shell: true
  const isWindows = process.platform === 'win32';
  const isCmd = command.endsWith('.cmd') || command.endsWith('.bat') || command === 'npm' || command === 'npm.cmd';
  const useShell = isWindows ? (isCmd || options.shell) : options.shell;

  const spawnOptions = Object.assign(
    { stdio: 'inherit' },
    options,
    { env, shell: useShell ?? false }
  );

  const proc = spawn(command, args, spawnOptions);
  proc.on('error', (err) => {
    console.error(`Failed to start ${command}:`, err.message || err);
  });
  return proc;
}

// Helper to kill entire process tree of spawned child
function killProcessTree(proc) {
  if (!proc || !proc.pid) return;
  const pid = proc.pid;
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /F /T /PID ${pid}`, { stdio: 'ignore' });
    } else {
      proc.kill('SIGTERM');
      setTimeout(() => {
        try { proc.kill('SIGKILL'); } catch (e) {}
      }, 1000);
    }
  } catch (e) {
    try { proc.kill(); } catch (err) {}
  }
}

// Start backend with port detection, freeing, and retry
async function startBackendWithRetry(backendPort, maxRetries = 3) {
  let attempt = 0;
  let currentPort = backendPort;
  while (attempt < maxRetries) {
    attempt++;
    console.log(`Starting backend server (attempt ${attempt}/${maxRetries}) on port ${currentPort}...`);
    
    try {
      await freePort(currentPort);
    } catch (e) {
      console.warn(`Could not free port ${currentPort}:`, e.message);
    }
    
    let freeBackendPort;
    try {
      freeBackendPort = await findFreePort(currentPort, currentPort + 10);
    } catch (e) {
      console.warn(`Could not find free port starting at ${currentPort}:`, e.message);
      currentPort += 11;
      continue;
    }
    
    const backendCmd = pythonCmd;
    const backendArgs = ['-m', 'uvicorn', 'app.main:app', '--reload', '--port', String(freeBackendPort)];
    const backend = spawnProcess(backendCmd, backendArgs, { cwd: BACKEND_DIR });
    
    const backendUrl = `http://127.0.0.1:${freeBackendPort}/`;
    console.log(`Waiting for backend at ${backendUrl} ...`);
    try {
      await waitForUrl(backendUrl, 12000);
      console.log(`Backend is ready on port ${freeBackendPort}.`);
      return { backend, port: freeBackendPort };
    } catch (err) {
      console.error(`Backend failed to become ready on port ${freeBackendPort}:`, err.message || err);
      killProcessTree(backend);
      currentPort = freeBackendPort + 1; // Try next port on next attempt
    }
  }
  throw new Error(`Failed to start backend server after ${maxRetries} attempts.`);
}

// Start frontend with port detection, freeing, and retry
async function startFrontendWithRetry(frontendStartPort, freeBackendPort, maxRetries = 3) {
  let attempt = 0;
  let currentPort = frontendStartPort;
  while (attempt < maxRetries) {
    attempt++;
    console.log(`Starting frontend server (attempt ${attempt}/${maxRetries}) on port ${currentPort}...`);
    
    try {
      await freePort(currentPort);
    } catch (e) {
      console.warn(`Could not free port ${currentPort}:`, e.message);
    }
    
    let freeFrontendPort;
    try {
      freeFrontendPort = await findFreePort(currentPort, currentPort + 20);
    } catch (e) {
      console.warn(`Could not find free port starting at ${currentPort}:`, e.message);
      currentPort += 21;
      continue;
    }
    
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const frontendArgs = ['run', 'dev', '--', '--port', String(freeFrontendPort)];
    const frontendEnv = {
      VITE_API_URL: `http://127.0.0.1:${freeBackendPort}/api/v1`
    };
    const frontend = spawnProcess(npmCmd, frontendArgs, { cwd: FRONTEND_DIR, env: frontendEnv });
    
    const frontendUrl = `http://127.0.0.1:${freeFrontendPort}/`;
    console.log(`Waiting for frontend at ${frontendUrl} ...`);
    try {
      await waitForUrl(frontendUrl, 15000);
      console.log(`Frontend is ready on port ${freeFrontendPort}.`);
      return { frontend, port: freeFrontendPort, url: frontendUrl };
    } catch (err) {
      console.error(`Frontend failed to become ready on port ${freeFrontendPort}:`, err.message || err);
      killProcessTree(frontend);
      currentPort = freeFrontendPort + 1; // Try next port on next attempt
    }
  }
  throw new Error(`Failed to start frontend server after ${maxRetries} attempts.`);
}

async function start() {
  let backendData = null;
  let frontendData = null;

  try {
    // 1. Sanity checks: python and uvicorn availability
    try {
      execSync(`"${pythonCmd}" -c "import uvicorn"`, { stdio: 'ignore' });
    } catch (e) {
      console.warn(`Warning: Python or uvicorn not found using "${pythonCmd}". Ensure backend requirements are installed (pip install -r backend/requirements.txt).`);
    }

    // 2. Start Backend
    const backendPort = process.env.BACKEND_PORT ? Number(process.env.BACKEND_PORT) : 8000;
    backendData = await startBackendWithRetry(backendPort, 3);

    // 3. Start Frontend
    const frontendStartPort = process.env.FRONTEND_PORT ? Number(process.env.FRONTEND_PORT) : 5173;
    frontendData = await startFrontendWithRetry(frontendStartPort, backendData.port, 3);

    // 4. Open Browser only after BOTH are fully running
    const openUrl = frontendData.url;
    console.log(`Opening browser at ${openUrl} ...`);
    if (process.platform === 'win32') {
      exec(`start "" "${openUrl}"`);
    } else if (process.platform === 'darwin') {
      exec(`open "${openUrl}"`);
    } else {
      exec(`xdg-open "${openUrl}" || true`);
    }

    // Handle termination: kill processes properly
    function shutdown() {
      console.log('Shutting down child processes...');
      if (backendData && backendData.backend) {
        killProcessTree(backendData.backend);
      }
      if (frontendData && frontendData.frontend) {
        killProcessTree(frontendData.frontend);
      }
      process.exit();
    }
    
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    process.on('exit', shutdown);
    
  } catch (err) {
    console.error('Fatal error during startup:', err.message || err);
    if (backendData && backendData.backend) killProcessTree(backendData.backend);
    if (frontendData && frontendData.frontend) killProcessTree(frontendData.frontend);
    process.exitCode = 1;
  }
}

start();
