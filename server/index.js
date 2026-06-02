// index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const https = require('https');
const os = require('os');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

const reactBuildDir = path.resolve('build');
const staticHtmlDir = path.resolve('static-html');
const hasReactBuild = fs.existsSync(path.join(reactBuildDir, 'index.html'));

app.use(express.static(hasReactBuild ? reactBuildDir : staticHtmlDir));

// Konfiguration importieren
const { MONGODB_URI, PORT, JWT_SECRET } = require('./config');

// Verbindung zur MongoDB
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI ist nicht gesetzt. Bitte Umgebungsvariable in Render prüfen.');
} else {
  mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 15000,
    family: 4
  })
    .then(() => console.log('✅ Verbunden mit MongoDB'))
    .catch(err => {
      console.error('❌ MongoDB-Verbindung fehlgeschlagen:', err.message);
      console.error('ℹ️ Prüfe Atlas Network Access (IP Allow List), DB-User-Rechte und URI.');
    });
}

// SCHEMAS & MODELS
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String, // Passwort-Hash
  role: String
});

const mediaSchema = new mongoose.Schema({
  title: String,
  mediaType: String,
  available: Boolean
});

const loanSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, ref: 'User' }, // Referenz zu User
  mediaId: { type: mongoose.Types.ObjectId, ref: 'Media' }, // Referenz zu Media
  borrowedAt: Date,
  returnedAt: Date
});

const User = mongoose.model('User', userSchema);
const Media = mongoose.model('Media', mediaSchema);
const Loan = mongoose.model('Loan', loanSchema);

function getServerHost() {
  return process.env.HOST || os.hostname() || 'localhost';
}

function resolveHttpsCredentials() {
  const certCandidates = [
    { key: 'certs/key.pem', cert: 'certs/cert.pem' },
    { key: 'certs/key.key', cert: 'certs/cert.crt' },
    { key: 'server/certs/key.pem', cert: 'server/certs/cert.pem' },
    { key: 'server/certs/key.key', cert: 'server/certs/cert.crt' }
  ];

  for (const candidate of certCandidates) {
    const keyPath = path.resolve(candidate.key);
    const certPath = path.resolve(candidate.cert);
    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      return {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
      };
    }
  }

  return null;
}

// Auth-Middleware
function authMiddleware(req, res, next) {
  const acceptsHtml = (req.headers.accept || '').includes('text/html');

  // Browser-Navigation zur React-SPA ohne Token erlauben.
  if (req.method === 'GET' && acceptsHtml) {
    return next();
  }

  if (
    req.path === '/' ||
    req.path === '/api' ||
    req.path === '/health' ||
    req.path === '/login' ||
    req.path === '/register'
  ) {
    return next();
  }
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Nicht autorisiert' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Ungültiger Token' });
  }
}

app.use(authMiddleware);

app.get('/api', (req, res) => {
  res.json({ message: 'Medienausleihe API online' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ROUTES


// Registrierung: Neuen Benutzer mit Passwort anlegen
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Prüfe, ob E-Mail schon existiert
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'E-Mail bereits registriert' });
    }
    // Passwort hashen
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Benutzer speichern
    const newUser = await User.create({ name, email, password: hashedPassword, role: "user" });
    res.status(201).json({ message: 'Registrierung erfolgreich', user: { _id: newUser._id, name: newUser.name, email: newUser.email } });
  } catch (error) {
    res.status(500).json({ message: 'Fehler bei der Registrierung', error });
  }
});

// Login: Benutzer authentifizieren
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Ungültige E-Mail oder Passwort' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Ungültige E-Mail oder Passwort' });
    }
    // JWT erzeugen (jetzt mit name und role)
    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '2h' }
    );
    res.json({ message: 'Login erfolgreich', token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Login', error });
  }
});

// Alle verfügbaren Medien abrufen
app.get('/media', async (req, res) => {
  const media = await Media.find();
  res.json(media);
});

// Neues Medium hinzufügen
app.post('/media', async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Nur Admins dürfen Medien hinzufügen.' });
  }
  const { title, mediaType, available } = req.body;

  try {
    const newMedia = await Media.create({ title, mediaType, available });
    res.status(201).json({ message: 'Medium erfolgreich hinzugefügt', media: newMedia });
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Hinzufügen des Mediums', error });
  }
});

// Medium ausleihen
app.post('/loan', async (req, res) => {
  const { userId, mediaId } = req.body;

  try {
    if (!mediaId) {
      return res.status(400).json({ message: 'Medium ist erforderlich.' });
    }

    // Admin darf für beliebige Nutzer ausleihen; normale Nutzer nur für sich selbst.
    const effectiveUserId = req.user.role === 'admin' ? userId : req.user.userId;
    if (!effectiveUserId) {
      return res.status(400).json({ message: 'Benutzer ist erforderlich.' });
    }

    const media = await Media.findById(mediaId);
    if (!media || !media.available) {
      return res.status(400).json({ message: 'Medium nicht verfügbar' });
    }

    await Loan.create({ userId: effectiveUserId, mediaId, borrowedAt: new Date() });
    media.available = false;
    await media.save();

    res.json({ message: 'Ausleihe erfolgreich' });
  } catch (error) {
    res.status(500).json({ message: 'Fehler bei der Ausleihe', error });
  }
});

// Medium zurückgeben
app.post('/return', async (req, res) => {
  const { loanId } = req.body;
  const loan = await Loan.findById(loanId);
  if (!loan || loan.returnedAt) {
    return res.status(400).json({ message: 'Ungültige Rückgabe' });
  }

  loan.returnedAt = new Date();
  await loan.save();

  const media = await Media.findById(loan.mediaId);
  media.available = true;
  await media.save();

  res.json({ message: 'Medium zurückgegeben' });
});

// Aktive Ausleihen des eingeloggten Users abrufen
app.get('/loans', async (req, res) => {
  try {
    const userId = req.user.userId; // aus JWT
    const loans = await Loan.find({ returnedAt: null, userId })
      .populate('mediaId', 'title');
    const formattedLoans = loans.map(loan => ({
      _id: loan._id,
      title: loan.mediaId.title
    }));
    res.json(formattedLoans);
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Abrufen der Ausleihen', error });
  }
});

// Alle Ausleihen abrufen (nur für Admins)
app.get('/loans/all', async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Nur Admins dürfen alle Ausleihen sehen.' });
  }
  try {
    const loans = await Loan.find({ returnedAt: null })
      .populate('userId', 'name')
      .populate('mediaId', 'title');

    const formattedLoans = loans.map(loan => ({
      _id: loan._id,
      userId: loan.userId?._id?.toString?.() || loan.userId?.toString?.() || loan.userId,
      userName: loan.userId?.name || 'Unbekannt',
      title: loan.mediaId?.title || 'Unbekannt'
    }));
    res.json(formattedLoans);
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Abrufen der Ausleihen', error });
  }
});

// Alle Nutzer abrufen (nur für Admins, ohne eigenen Nutzer)
app.get('/users', async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Nur Admins dürfen alle Nutzer sehen.' });
  }
  try {
    const users = await User.find({ _id: { $ne: req.user.userId } }); // eigenen User ausfiltern
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Abrufen der Nutzer', error });
  }
});

// Nutzer hinzufügen (nur für Admins)
app.post('/users', async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Nur Admins dürfen Nutzer hinzufügen.' });
  }

  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, E-Mail und Passwort sind erforderlich.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'E-Mail bereits registriert' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user'
    });

    res.status(201).json({
      message: 'Benutzer erfolgreich hinzugefügt',
      user: { _id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Hinzufügen des Benutzers', error });
  }
});

// Nutzer löschen (nur wenn keine Ausleihe offen, nur für Admins)
app.delete('/users/:id', async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Nur Admins dürfen Nutzer löschen.' });
  }
  const userId = req.params.id;
  const hasLoan = await Loan.exists({ userId, returnedAt: null });
  if (hasLoan) {
    return res.status(400).json({ message: 'Nutzer hat noch ausgeliehene Medien.' });
  }
  await User.findByIdAndDelete(userId);
  res.json({ message: 'Nutzer gelöscht.' });
});

// Nutzerrolle ändern (nur für Admins)
app.put('/users/:id/role', async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Nur Admins dürfen Rollen ändern.' });
  }
  const userId = req.params.id;
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Ungültige Rolle.' });
  }
  await User.findByIdAndUpdate(userId, { role });
  res.json({ message: 'Rolle aktualisiert.' });
});

// Medium löschen (nur für Admins, nur wenn verfügbar)
app.delete('/media/:id', async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Nur Admins dürfen Medien löschen.' });
  }
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ message: 'Medium nicht gefunden.' });
    }
    if (!media.available) {
      return res.status(400).json({ message: 'Nur verfügbare Medien können gelöscht werden.' });
    }
    await Media.findByIdAndDelete(req.params.id);
    res.json({ message: 'Medium gelöscht.' });
  } catch {
    res.status(500).json({ message: 'Fehler beim Löschen.' });
  }
});

if (hasReactBuild) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(reactBuildDir, 'index.html'));
  });
}

// Optional: HTTPS-Server starten, wenn Zertifikate vorhanden sind
const SERVER_HOST = getServerHost();

try {
  const credentials = resolveHttpsCredentials();
  if (credentials) {
    https.createServer(credentials, app).listen(PORT, () => {
      console.log(`🔒 HTTPS-Server läuft auf https://${SERVER_HOST}:${PORT}`);
    });
  } else {
    app.listen(PORT, () => {
      console.log(`🚀 Server läuft auf http://${SERVER_HOST}:${PORT}`);
    });
  }
} catch (err) {
  console.log('Fehler beim Start des HTTPS-Servers, Fallback auf HTTP:', err.message);
  app.listen(PORT, () => {
    console.log(`🚀 Server läuft auf http://${SERVER_HOST}:${PORT}`);
  });
}