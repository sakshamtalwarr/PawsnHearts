// Vercel Serverless Entrypoint for Express
try {
  const app = require('./dist/index.js');
  const handler = (req, res) => {
    return (app.default || app)(req, res);
  };
  module.exports = handler;
  module.exports.default = handler;
} catch (e) {
  try {
    require('ts-node/register');
    const app = require('./src/index.ts');
    const handler = (req, res) => {
      return (app.default || app)(req, res);
    };
    module.exports = handler;
    module.exports.default = handler;
  } catch (err) {
    console.error('Failed to load server entrypoint:', err);
    throw err;
  }
}
