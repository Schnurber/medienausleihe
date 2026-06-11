const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

module.exports = {
  MONGODB_URI: process.env.MONGODB_URI,
  // In Produktion immer per Umgebungsvariable setzen.
  JWT_SECRET: process.env.JWT_SECRET || 'development_only_change_me',
  // Render setzt PORT als Umgebungsvariable.
  PORT: Number(process.env.PORT) || 3002
};
