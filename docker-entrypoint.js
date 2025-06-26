#!/usr/bin/env node

const { spawn } = require('node:child_process');

const env = { ...process.env };

(async () => {
  // If running the web server then prerender pages
  if (process.argv.slice(-3).join(' ') === 'npm run start') {
    await exec('npx next build --experimental-build-mode generate');
  }

  // launch application
  await exec(process.argv.slice(2).join(' '));
})();

function exec(command) {
  // Split the command into arguments safely to avoid shell: true
  const args = command.split(' ');
  const cmd = args.shift();
  
  const child = spawn(cmd, args, { stdio: 'inherit', env });
  return new Promise((resolve, reject) => {
    child.on('exit', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} failed rc=${code}`));
      }
    });
  });
}
