#!/usr/bin/env bun
import { execSync } from 'node:child_process';

function runCommand(command: string, description: string): void {
  console.log(`🧹 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    console.log(`✅ ${description} completed`);
  } catch {
    console.warn(`⚠️  ${description} failed (this might be expected)`);
  }
}

console.log('🚀 Starting clean process...');

// Reset Nx cache
runCommand('nx reset', 'Resetting Nx cache');

// Remove all dist directories
runCommand(
  'find . -name "dist" -type d -exec rm -rf {} + 2>/dev/null || true',
  'Removing dist directories'
);

// Remove all node_modules directories
runCommand(
  'find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true',
  'Removing node_modules directories'
);

console.log('✨ Clean process completed!');
