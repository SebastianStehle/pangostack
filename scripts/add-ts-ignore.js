import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Adds TypeScript ignore comments to generated files
 * Usage: node scripts/add-ts-ignore.js <directory>
 */

function addTsIgnoreToFile(filePath) {
  const content = readFileSync(filePath, 'utf8');

  if (filePath.endsWith('.ts') && !content.startsWith('// @ts-ignore')) {
    const newContent = `/* eslint-disable */\n// @ts-nocheck\n${content}`;
    writeFileSync(filePath, newContent, 'utf8');
    console.log(`Added TypeScript ignore to: ${filePath}`);
  }
}

function addTsIgnoreToDirectory(dir) {
  try {
    readdirSync(dir).forEach((file) => {
      const filePath = join(dir, file);
      const stats = statSync(filePath);

      if (stats.isDirectory()) {
        addTsIgnoreToDirectory(filePath);
      } else if (stats.isFile() && filePath.endsWith('.ts')) {
        addTsIgnoreToFile(filePath);
      }
    });
  } catch (error) {
    console.error(`Error processing directory ${dir}:`, error.message);
  }
}

// Get directory from command line arguments
const directory = process.argv[2];

if (!directory) {
  console.error('Usage: node scripts/add-ts-ignore.js <directory>');
  process.exit(1);
}

console.log(`Processing directory: ${directory}`);
addTsIgnoreToDirectory(directory);
console.log('Finished processing TypeScript files.');
