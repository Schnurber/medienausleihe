// const LOCAL_MONGODB_URI = 'mongodb://localhost:27017/medienausleihe';

module.exports = {
  // Wenn hier nichts eingetragen ist, wird MONGODB_URI aus den Umgebungsvariablen verwendet.
  MONGODB_URI: LOCAL_MONGODB_URI || process.env.MONGODB_URI,
  PORT: 3002
};
