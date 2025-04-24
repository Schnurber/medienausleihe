// index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

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
  email: String
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

// ROUTES

// Alle Nutzer abrufen
app.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Neuen Benutzer hinzufügen
app.post('/users', async (req, res) => {
  const { name, email } = req.body;

  try {
    const newUser = await User.create({ name, email });
    res.status(201).json({ message: 'Benutzer erfolgreich hinzugefügt', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Hinzufügen des Benutzers', error });
  }
});

// Alle verfügbaren Medien abrufen
app.get('/media', async (req, res) => {
  const media = await Media.find();
  res.json(media);
});

// Neues Medium hinzufügen
app.post('/media', async (req, res) => {
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

// Aktive Ausleihen abrufen
app.get('/loans', async (req, res) => {
  try {
    const loans = await Loan.find({ returnedAt: null })
      .populate('userId', 'name')
      .populate('mediaId', 'title');


    const formattedLoans = loans.map(loan => ({
      _id: loan._id,
      userName: loan.userId.name,
      mediaTitle: loan.mediaId.title
    }));
    res.json(formattedLoans);
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Abrufen der Ausleihen', error });
  }
});

// Server starten
app.listen(3000, () => {
  console.log("🚀 Server läuft auf http://localhost:3000");
});
