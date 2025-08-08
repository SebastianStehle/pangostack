import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';

const directory = './src/domain/worker/generated';

function addTsIgnoreToFile(filePath) {
  const content = readFileSync(filePath, 'utf8');

  if (filePath.endsWith('.ts') && !content.startsWith('// @ts-ignore')) {
    const newContent = `/* eslint-disable */\n// @ts-nocheck\n${content}`;
    writeFileSync(filePath, newContent, 'utf8');
  }
}

function addTsIgnoreToDirectory(dir) {
  readdirSync(dir).forEach((file) => {
    const filePath = join(dir, file);
    const stats = statSync(filePath);

    if (stats.isDirectory()) {
      addTsIgnoreToDirectory(filePath);
    } else if (stats.isFile() && filePath.endsWith('.ts')) {
      addTsIgnoreToFile(filePath);
    }
  });
}

addTsIgnoreToDirectory(directory);
