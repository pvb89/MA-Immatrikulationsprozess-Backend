var express = require('express'),
    router = express.Router();
  const mysql = require('mysql');
  // const mysql = require('./configuration/db.js');

router.post('/registrierung', (req, res) => {

  // eMail Adresse aus der Datenbank auslesen, um zu prüfen ob Sie schon vorhanden ist
  let sqlStatment = 'SELECT mail FROM benutzer WHERE mail = ' + mysql.escape(req.body.mail);

  connection.query(sqlStatment, (err, rows) => {

    if (err) {
      console.log('Registrierung fehlgeschlagen - Die Datenbank konnte nicht ausgelesen werden - SQL Statment: ' + sqlStatment);
      return res.status(500).send({
        msg: errorMsg
      });
    }

    // Prüfen ob es schon einen Eintrag in der Datenbank gibt
    if (rows.length) {
      console.log(`Registrierung fehlgeschlagen - Die eMail Adresse ${req.body.mail} wird schon verwendet`);
      return res.status(500).send({
        msg: `Die eMail Adresse ${req.body.mail} wird schon verwendet, bitte wählen Sie eine andere aus`
      });
    }

    // Klartext Kennwort hashn 
    let hash = bcrypt.hashSync(req.body.password1, 1);

    // Neuen Benutzer in die Datenbank schreiben
    let value = mysql.escape(req.body.mail) + ', \'' + hash + '\'';
    let sqlStatment = 'INSERT INTO benutzer (mail,passwort) VALUES (' + value + ')';

    connection.query(sqlStatment, (err) => {
      if (err) {
        console.log('Registrierung fehlgeschlagen - Es konnte kein Eintrag in die Datenbank geschrieben werden - SQL Statment: ' + sqlStatment);
        return res.status(500).send({
          msg: errorMsg
        });
      }

      // Ausgabe nach erfolgreichen durchlaufen der Datenbank Querys
      console.log(`${req.body.mail} wurde erfolgreich registriert`);
      return res.status(200).send({
        msg: `${req.body.mail} wurde erfolgreich registriert`
      });
    });


  });

});

module.exports = router;