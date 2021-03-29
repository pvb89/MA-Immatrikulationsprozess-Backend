const mysql = require('mysql');
const config = require('./config.js');

// Connection vorbereiten
const connection = mysql.createConnection({
  host: config.HOST,
  user: config.USER,
  password: config.PASSWORD,
  database: config.DB
})

// via connection zur DB verbinden 
connection.connect(function (err) {

  // Fehlerhandling
  if (err) {
    console.error('Verbindung zur Datenbank fehlgeschlagen ' + err.stack);
    return;
  }
  // Ausgabe nach erfolgreichen verbinden
  console.log('Verbindung zur Datenbank erfolgreich - ConnectionId: ' + connection.threadId);
});

module.exports = connection;