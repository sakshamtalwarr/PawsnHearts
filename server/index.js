// Vercel Serverless Entrypoint for Express
try {
  const app = require('./dist/index.js');
  module.exports = app.default || app;
} catch (e) {
  try {
    require('ts-node/register');
    const app = require('./src/index.ts');
    module.exports = app.default || app;
  } catch (err) {
    console.error('Failed to load server entrypoint:', err);
    throw err;
  }
}
