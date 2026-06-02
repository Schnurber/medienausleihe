const LOCAL_MONGODB_URI = '';
const LOCAL_JWT_SECRET = '';

module.exports = {
  // Optional lokal setzen, sonst Umgebungsvariable verwenden.
  MONGODB_URI: LOCAL_MONGODB_URI || process.env.MONGODB_URI,
  // In Produktion immer per Umgebungsvariable setzen.
  JWT_SECRET: LOCAL_JWT_SECRET || process.env.JWT_SECRET || 'development_only_change_me',
  // Render setzt PORT als Umgebungsvariable.
  PORT: Number(process.env.PORT) || 3002
};
