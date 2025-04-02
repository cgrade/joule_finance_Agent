#!/usr/bin/env node
import { spawn } from 'child_process';
import process from 'process';

// Get the TypeScript file to run from command line arguments
const tsFile = process.argv[2];
const args = process.argv.slice(3);

// Use ts-node to run the TypeScript file
const child = spawn('node', ['--loader', 'ts-node/esm', tsFile, ...args], {
  stdio: 'inherit',
  env: process.env
});

child.on('exit', (code) => {
  process.exit(code);
}); 