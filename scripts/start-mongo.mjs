import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function checkRunningPid() {
  try {
    const out = execSync('lsof -t -i :27017', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    if (out) return out.split('\n')[0];
  } catch {
    // ignore
  }
  return null;
}

function findMongod() {
  const candidates = [
    process.env.MONGOMS_SYSTEM_BINARY,
    '/opt/homebrew/bin/mongod',
    '/usr/local/bin/mongod',
  ].filter(Boolean);

  for (const c of candidates) {
    if (fs.existsSync(c)) {
      try {
        fs.accessSync(c, fs.constants.X_OK);
        return c;
      } catch {
        // continue
      }
    }
  }
  return 'mongod';
}

async function main() {
  const pid = checkRunningPid();
  if (pid) {
    console.log(`✅ MongoDB is already running on port 27017 (PID: ${pid}). Ready to connect!`);
    console.log('You can run: npm run dev');
    process.exit(0);
  }

  const mongodBin = findMongod();
  const dbDir = path.resolve('.data/db');
  const logFile = path.resolve('.data/mongodb.log');
  fs.mkdirSync(dbDir, { recursive: true });

  console.log(`Starting local MongoDB on 127.0.0.1:27017 using ${mongodBin}...`);

  const proc = spawn(
    mongodBin,
    [
      '--dbpath',
      dbDir,
      '--logpath',
      logFile,
      '--fork',
      '--bind_ip',
      '127.0.0.1',
      '--wiredTigerCacheSizeGB',
      '0.25',
    ],
    { stdio: 'inherit' }
  );

  proc.on('exit', (code) => {
    if (code === 0) {
      console.log('✅ MongoDB started successfully on mongodb://127.0.0.1:27017/screenme');
      console.log('You can now run: npm run dev');
      process.exit(0);
    } else {
      console.error(`mongod exited with code ${code}. Check logs at: ${logFile}`);
      process.exit(code || 1);
    }
  });
}

main().catch((err) => {
  console.error('Failed to start MongoDB:', err);
  process.exit(1);
});
