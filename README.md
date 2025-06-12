# Medienausleihe

Dieses Projekt ermöglicht die Verwaltung von Medienausleihen mit einem Node.js-Backend und einer MongoDB-Datenbank.

## Komponenten-Übersicht (React)

- **Auth.jsx**  
  Login- und Registrierungsformular. Nach erfolgreichem Login wird das Token gespeichert und die Seite neu geladen.

- **ManageMedia.jsx**  
  Verwaltung der Medien: Medien können hinzugefügt und (sofern verfügbar) gelöscht werden. Die Medien werden in einer Liste angezeigt, Checkboxen erlauben Mehrfachlöschung.

- **ManageUser.jsx**  
  Verwaltung der Nutzer: Nutzer können gelöscht werden (nur wenn keine Ausleihe offen ist) und die Rolle ("user"/"admin") kann geändert werden. Der eigene Nutzer wird nicht angezeigt.

- **LoanMedia.jsx**  
  Ermöglicht eingeloggten Nutzern das Ausleihen von Medien. Es werden nur verfügbare Medien angezeigt.

- **ReturnMedia.jsx**  
  Zeigt die eigenen ausgeliehenen Medien an und ermöglicht deren Rückgabe.

- **App.jsx**  
  Hauptkomponente, die das Routing und das Menü steuert. Zeigt je nach Rolle und Login-Status die passenden Menüpunkte und Komponenten.

---

## Voraussetzungen

- [Node.js](https://nodejs.org/) (Version 16 oder höher)
- [MongoDB](https://www.mongodb.com/) (Community Edition)

---

## Schritt-für-Schritt-Anleitung

### 1. MongoDB installieren

#### macOS:
1. Füge das MongoDB-Homebrew-Repository hinzu:
   ```bash
   brew tap mongodb/brew
   ```
2. Installiere MongoDB:
   ```bash
   brew install mongodb-community@7.0
   ```
3. Starte den MongoDB-Dienst:
   ```bash
   brew services start mongodb/brew/mongodb-community@7.0
   ```

#### Windows/Linux:
- Lade MongoDB von der offiziellen Website herunter: [MongoDB Community Edition](https://www.mongodb.com/try/download/community).
- Folge den Installationsanweisungen für dein Betriebssystem.

---

### 2. MongoDB starten

1. Öffne die MongoDB-Shell:
   ```bash
   mongosh
   ```
2. Überprüfe die verfügbaren Datenbanken:
   ```bash
   show dbs
   ```
3. Wechsle zur Datenbank `medienausleihe` (erstellt sie, falls sie nicht existiert):
   ```bash
   use medienausleihe
   ```

---

### 3. Collections anlegen

1. Füge Benutzer-Daten hinzu:
   ```bash
   db.users.insertMany([
     { name: "Max Mustermann", email: "max@example.com" },
     { name: "Erika Musterfrau", email: "erika@example.com" }
   ])
   ```
2. Füge Medien-Daten hinzu:
   ```bash
   db.media.insertMany([
     { title: "Der Herr der Ringe", mediaType: "Buch", available: true },
     { title: "Inception", mediaType: "DVD", available: true },
     { title: "Harry Potter", mediaType: "Buch", available: true }
   ])
   ```
3. Füge eine Beispiel-Ausleihe hinzu (ersetze `DEINE_USER_ID` und `DEINE_MEDIA_ID` durch echte IDs):
   ```bash
   db.loans.insertOne({
     userId: ObjectId("DEINE_USER_ID"),
     mediaId: ObjectId("DEINE_MEDIA_ID"),
     borrowedAt: new Date(),
     returnedAt: null
   })
   ```

---

### 4. MongoDB GUI (optional)

- Lade [MongoDB Compass](https://www.mongodb.com/try/download/compass) herunter, um die Datenbank und Collections visuell zu verwalten.

---

### 5. Backend starten

1. Stelle sicher, dass du dich im Projektverzeichnis befindest:

   ```bash
   cd <Projektordner>
   ```
2. Installiere die Abhängigkeiten:

   ```bash
   npm install
   ```
3. Zertifikate für https(optional)

   ```
    mkdir certs
    cd certs
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout key.key -out cert.crt
   ```
4. Konfiguriere API-Server server/config.js

5. Konfiguruere Webseite src/config.js mit Bas-Url des API-Servers, am Besten: IP:

   ```bash
   curl ifconfig.me
   ```
   
6. Starte den Server im Hintergrund (läuft bei Beendigung der Konsole weiter):

   ```bash
   nohup node server/index.js &
   ```

   Wieder beenden: 

   ```bash
   pgrep node
   kill PID
   ```

7. Der Server läuft nun unter: [http://localhost:3000](http://localhost:3000)

8. Build

   starten oder

   ```bash
   npm start
   ```

   build:
   ```bash
   npm run build
   ```

---

### API-Endpunkte

- **GET** `/users`: Alle Benutzer abrufen
- **POST** `/users`: Neuen Benutzer hinzufügen
- **GET** `/media`: Alle Medien abrufen
- **POST** `/media`: Neues Medium hinzufügen
- **POST** `/loan`: Medium ausleihen
- **POST** `/return`: Medium zurückgeben
- **GET** `/loans`: Aktive Ausleihen abrufen

---

Viel Erfolg mit der Medienausleihe!

