# Medienausleihe

Webanwendung zur Verwaltung von Medienausleihen mit React-Frontend, Express-Backend und MongoDB.

## Funktionen

- Login und Registrierung mit JWT
- Rollenbasierte Navigation (user und admin)
- Medien ausleihen und zurueckgeben
- Admin: Medien verwalten (anlegen, mehrere loeschen)
- Admin: Nutzer verwalten (Rollen aendern, mehrere loeschen)
- Moderne, responsive UI

## Tech-Stack

- Frontend: React, React Router
- Backend: Node.js, Express
- Datenbank: MongoDB (lokal oder Atlas)
- Auth: JSON Web Token

## Projektstruktur

- src: React-App
- server: Express-API und Konfiguration
- static-html: aeltere statische Variante
- public: statische Frontend-Dateien

## Voraussetzungen

- Node.js 18 oder neuer
- MongoDB lokal oder MongoDB Atlas

## Installation

1. Abhaengigkeiten installieren:

   npm install

2. Lokale Umgebungsvariablen in .env setzen (Datei liegt im Projektroot):

   MONGODB_URI=mongodb://127.0.0.1:27017/medienausleihe
   JWT_SECRET=dein_langes_sicheres_secret
   REACT_APP_API_BASE_URL=http://localhost:3002

Hinweise:
- Die Datei .env ist in .gitignore und wird nicht mitcommittet.
- Wenn .env nicht existiert, laeuft die App trotzdem. Dann kommen Werte nur aus echten Umgebungsvariablen.
- REACT_APP_API_BASE_URL ist optional. Ohne Wert nutzt das Frontend lokal automatisch http://localhost:3002.

## Starten

Backend starten:

npm start

Frontend im Dev-Modus starten:

npm run start:client

Produktions-Build erstellen:

npm run build

## API (Kurzueberblick)

Auth:
- POST /register
- POST /login

Medien:
- GET /media
- POST /media (admin)
- DELETE /media/:id (admin)

Nutzer:
- GET /users (admin)
- DELETE /users/:id (admin)
- PUT /users/:id/role (admin)

Ausleihen:
- POST /loan
- POST /return
- GET /loans
- GET /loans/all (admin)

## Deployment (Render + MongoDB Atlas)

1. MongoDB Atlas
- Cluster erstellen
- Datenbanknutzer anlegen
- IP Access List konfigurieren
- Connection String als MONGODB_URI verwenden

2. Render Web Service
- Repository und Branch verbinden
- Build Command: npm install && npm run build
- Start Command: npm start
- Umgebungsvariablen setzen:
  - MONGODB_URI
  - JWT_SECRET
  - optional REACT_APP_API_BASE_URL

## Sicherheit

- Keine echten Secrets im Code oder in Git speichern
- JWT_SECRET in Produktion immer als sichere Umgebungsvariable setzen
- Verbindung zur Datenbank nur mit minimal noetigen Rechten konfigurieren

## Lizenz

Siehe LICENSE.
