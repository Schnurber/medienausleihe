const LOCAL_MONGODB_URI = '';

module.exports = {
  // Optional lokal setzen, sonst Umgebungsvariable verwenden.
  MONGODB_URI: LOCAL_MONGODB_URI || process.env.MONGODB_URI,
  // Render setzt PORT als Umgebungsvariable.
  PORT: Number(process.env.PORT) || 3002
};
