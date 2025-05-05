#!/usr/bin/env node

/**
 * This script generates a runtime configuration file that can be loaded by the static website.
 * It reads environment variables and creates a config.js file in the dist directory.
 */

const fs = require('fs');
const path = require('path');

// Get the dist directory path
const distDir = path.resolve(__dirname, '../dist');

// Ensure the dist directory exists
if (!fs.existsSync(distDir)) {
  console.error('Error: dist directory does not exist. Run npm run build first.');
  process.exit(1);
}

// Create the runtime config content
const configContent = `
// Runtime configuration - Generated at build time
window.ENV = {
  VITE_REACT_APP_API_BASE_URL: "${process.env.VITE_REACT_APP_API_BASE_URL || 'http://localhost:3000'}",
  NODE_ENV: "${process.env.NODE_ENV || 'production'}"
};
`;

// Write the config file
fs.writeFileSync(path.join(distDir, 'config.js'), configContent.trim());

console.log('Runtime configuration file generated successfully.');
