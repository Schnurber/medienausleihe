// index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

// Verbindung zur MongoDB
mongoose.connect('mongodb://localhost:27017/medienausleihe')
  .then(() => console.log("✅ Verbunden mit MongoDB"))
  .catch(err => console.error("❌ MongoDB-Verbindung fehlgeschlagen:", err));

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

const JWT_SECRET = 'dein_geheimes_jwt_secret'; // In Produktion in ENV auslagern

// Auth-Middleware
function authMiddleware(req, res, next) {
  if (
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

  const media = await Media.findById(mediaId);
  if (!media || !media.available) {
    return res.status(400).json({ message: 'Medium nicht verfügbar' });
  }

  await Loan.create({ userId, mediaId, borrowedAt: new Date() });
  media.available = false;
  await media.save();

  res.json({ message: 'Ausleihe erfolgreich' });
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

// Server starten
app.listen(3001, () => {
  console.log("🚀 Server läuft auf http://localhost:3001");
});