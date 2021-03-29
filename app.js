const express = require('express'),
  bodyParser = require('body-parser'),
  bcrypt = require('bcrypt'),
  jwt = require('jsonwebtoken'),
  cors = require('cors'),
  multer = require('multer');

//////////////////////////////////////////////////////////////////////////////////////////////////
// Misc.
//////////////////////////////////////////////////////////////////////////////////////////////////

const mysql = require('./configuration/db.js'),
  config = require('./configuration/config.js'),
  verificationMiddleware = require('./middleware/verification.js');

const port = 4000,
  errorMsg = 'Es gibt ein Problem, bitte probieren Sie es in 10 Minuten erneut';

const app = express();

//////////////////////////////////////////////////////////////////////////////////////////////////
// Express use FN 
//////////////////////////////////////////////////////////////////////////////////////////////////

// CORS - Prevention
app.use(cors());

// parse requests of content-type: application/json
app.use(bodyParser.json());

// parse requests of content-type: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: true
}));


function _regFailed(sql) {
  console.log('Registrierung fehlgeschlagen - Die Datenbank konnte nicht ausgelesen werden - SQL Statment: ' + sql);
  return res.status(500).send({
    msg: 'Es gibt ein Problem, bitte probieren Sie es in 10 Minuten erneut'
  });
}


//////////////////////////////////////////////////////////////////////////////////////////////////
// Benutzer Registrierung
//////////////////////////////////////////////////////////////////////////////////////////////////

app.post('/registrierung', (req, res) => {

  // eMail Adresse aus der Datenbank auslesen, um zu prüfen ob Sie schon vorhanden ist
  let sqlStatment = 'SELECT mail FROM benutzer WHERE mail = ' + mysql.escape(req.body.mail);

  mysql.query(sqlStatment, (err, rows) => {

    // Fehlerhandling für den sql Querys
    if (err) {
      console.log('Registrierung fehlgeschlagen - Die Datenbank konnte nicht ausgelesen werden - SQL Statment: ' + sqlStatment);
      return res.status(500).send({
        msg: errorMsg
      });
    }

    // if (err) _regFailed(sqlStatment);

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
    let value = mysql.escape(req.body.mail) + ', \'' + hash + '\' ,' + mysql.escape(req.body.vorname) + ', ' + mysql.escape(req.body.nachname);
    sqlStatment = 'INSERT INTO benutzer (mail,passwort,vorname,nachname) VALUES (' + value + ')';

    mysql.query(sqlStatment, (err, row) => {

      // Fehlerhandling für den sql Querys
      if (err) {
        console.log('Registrierung fehlgeschlagen - Es konnte kein Eintrag in die Datenbank geschrieben werden - SQL Statment: ' + sqlStatment);
        return res.status(500).send({
          msg: errorMsg
        });
      }

      // Ausgabe nach erfolgreichen durchlaufen der Datenbank Querys
      console.log(`Registrierung erfolgreich ${req.body.mail}`);
      return res.status(200).send({
        msg: `${req.body.mail} wurde erfolgreich registriert`
      });
    });


  });

});

//////////////////////////////////////////////////////////////////////////////////////////////////
// Benutzer Login
//////////////////////////////////////////////////////////////////////////////////////////////////

app.post('/anmeldung', (req, res) => {

  let sqlStatment = 'SELECT * FROM benutzer WHERE mail =' + mysql.escape(req.body.mail);

  // Datenbank auslesen
  mysql.query(sqlStatment, (err, rows) => {

    // Fehlerhandling für den sql Querys
    if (err) {
      console.log(`Anmeldung fehlgeschlagen - Die Datenbank konnte nicht ausgelesen werden - SQL Statment: ${sqlStatment}`);
      return res.status(500).send({
        msg: errorMsg
      });
    }

    // Prüfen ob ein Eintrag in der Datenbank gefunden wurde
    if (!rows.length) {
      console.log(`Anmeldung fehlgeschlagen - Die eMail Adresse ist nicht bekannt - eMail: ${req.body.mail}`);
      return res.status(401).send({
        msg: `Ihre eMail Adresse ${req.body.mail} oder Password ist falsch, bitte versuchen Sie es erneut`
      });
    }

    // Eingabe und Datenbankeintrag mithilfe der compareSync Methode von bcrypt prüfen - Rückgabe boolean
    let passwordIsValid = bcrypt.compareSync(req.body.password, rows[0].passwort);

    // Request abbrechen falls das Password ungültig ist
    if (!passwordIsValid) {
      console.log(`Anmeldung fehlgeschlagen - Falsches Passwort - eMail: ${rows[0].mail}`);
      return res.status(401).send({
        msg: `Ihre eMail Adresse ${req.body.mail} oder Password ist falsch, bitte versuchen Sie es erneut`
      });
    }

    // Letzten Login in Datenbank speichern
    // Datumsformat für Datenbank anpassen - Von "2020-03-23T16:30:55.054Z" zu "2020-03-23 16:30:55"
    let date = new Date().toJSON().slice(0, 19).replace('T', ' ');
    sqlStatment = 'UPDATE benutzer SET loginDate = \'' + date + '\' WHERE mail = \'' + rows[0].mail + '\'';

    mysql.query(sqlStatment, (err) => {

      // Fehlerhandling für den sql Querys
      if (err) {
        console.log(`Anmeldung fehlgeschlagen - LoginDate konnte nicht geupadet werden ${rows[0].mail}`);
        return res.status(500).send({
          msg: errorMsg
        });
      }

      // jsonwebtoken erstellen und mit der BenutzerId verbinden
      let token = jwt.sign({
        idBenutzer: rows[0].idBenutzer
      }, config.jwtSecret, {
        expiresIn: '7d'
      });

      // Ausgabe nach erfolgreichem durchlaufen der Datenbank Querys
      console.log(`Anmeldung erfolgreich - eMail: ${rows[0].mail} - Id: ${rows[0].idBenutzer} - Token: ${token}`)
      return res.status(200).send({
        msg: 'Anmeldung erfolgreich',
        token: token,
        user: {
          idBenutzer: rows[0].idBenutzer,
          mail: rows[0].mail,
          vorname: rows[0].vorname,
          nachname: rows[0].nachname
        }
      });
    });

  })
});

//////////////////////////////////////////////////////////////////////////////////////////////////
// In Studiengang einschreiben
//////////////////////////////////////////////////////////////////////////////////////////////////

app.post('/einschreiben', verificationMiddleware.verifyToken, (req, res) => {

  // Dokumente anlegen (Passbild & Hochschulberechtigung)
  let baDateiname = mysql.escape('bildungsabschluss-' + req.body.timestamp + '-' + req.body.idBenutzer + '.' + req.body.upload.fileBildungsabschlussType),
    baValue = baDateiname + ', \'bildungsabschluss\', ' + mysql.escape(req.body.upload.fileBildungsabschlussType) + ', ' + mysql.escape(req.body.timestamp),

    pbDateiname = mysql.escape('passbild-' + req.body.timestamp + '-' + req.body.idBenutzer + '.' + req.body.upload.filePassbildType),
    pbValue = pbDateiname + ', \'passbild\', ' + mysql.escape(req.body.upload.filePassbildType) + ', ' + mysql.escape(req.body.timestamp),

    sqlStatment = 'INSERT INTO dokument (bezeichnung,typ,filetype,timestamp) VALUES (' + baValue + '), (' + pbValue + ')';

  mysql.query(sqlStatment, (err, rowsDokument) => {

    // Fehlerhandling für den sql Querys
    if (err) {
      console.log('Einschreibung fehlgeschlagen - Es konnte kein Eintrag in die Datenbank geschrieben werden - SQL Statment: ' + sqlStatment);
      return res.status(500).send({
        msg: errorMsg
      });
    }

    // Antrag erstellen
    // TODO: Studiengang dynamisch gestalten
    let dateSliceTime = new Date().toJSON().slice(0, 19).replace('T', ' ');

    let bildungsabschluss = rowsDokument.insertId;
    let passbild = rowsDokument.insertId + 1;

    let idBenutzer = mysql.escape(req.body.idBenutzer),
      idStudiengang = mysql.escape(req.body.studiengang.value),
      date = mysql.escape(dateSliceTime),
      geschlecht = mysql.escape(req.body.person.geschlecht.value),
      geburtsdatum = mysql.escape(req.body.person.geburtsdatum),
      geburtsort = mysql.escape(req.body.person.geburtsort),
      geburtsland = mysql.escape(req.body.person.geburtsland),
      staatsangehörigkeit = mysql.escape(req.body.person.staatsangehörigkeit),
      strasseHausNr = mysql.escape(req.body.postanschrift.strasse),
      plz = mysql.escape(req.body.postanschrift.plz),
      ort = mysql.escape(req.body.postanschrift.ort),
      land = mysql.escape(req.body.postanschrift.adresseLand),
      landkreisAbschluss = mysql.escape(req.body.hochschulreife.landkreis),
      artAbschluss = mysql.escape(req.body.hochschulreife.art.value),
      durschnittsnoteAbschluss = mysql.escape(req.body.hochschulreife.durchschnittsnote),
      datumAbschluss = mysql.escape(req.body.hochschulreife.datumHochschulreife),
      versicherungsstatus = mysql.escape(req.body.krankenkasse.krankenversicherungStatus.text),
      krankenkasse = mysql.escape(req.body.krankenkasse.name),
      versicherungsnummer = mysql.escape(req.body.krankenkasse.versicherungsnummer);

    let insert = 'idBenutzerAntrag, idStudiengang, idBildungsabschluss, idPassbild, status, datum, geschlecht, geburtsdatum, geburtsort, geburtsland, staatsangehörigkeit, strasseHausNr, plz, ort, land, artAbschluss, datumAbschluss, landkreisAbschluss, durschnittsnoteAbschluss, versicherungsstatus, krankenkasse, versicherungsnummer';
    let value = idBenutzer + ', ' + idStudiengang + ', ' + bildungsabschluss + ', ' + passbild + ', \'1\' ,' + date + ', ' + geschlecht + ', ' + geburtsdatum + ', ' + geburtsort + ', ' + geburtsland + ', ' + staatsangehörigkeit + ', ' + strasseHausNr + ', ' + plz + ', ' + ort + ', ' + land + ', ' + artAbschluss + ', ' + datumAbschluss + ', ' + landkreisAbschluss + ', ' + durschnittsnoteAbschluss + ', ' + versicherungsstatus + ', ' + krankenkasse + ', ' + versicherungsnummer;

    sqlStatment = 'INSERT INTO antrag (' + insert + ') VALUES (' + value + ')';

    mysql.query(sqlStatment, (err, rowsAntrag) => {

      // Fehlerhandling für den sql Querys
      if (err) {
        console.log(`Einschreibung fehlgeschlagen - Es konnte kein Eintrag in die Datenbank geschrieben werden - SQL Statment: ${sqlStatment}`);
        return res.status(500).send({
          msg: errorMsg
        });
      }
      console.log(`Einschreibung erfolgreich - Ihre Antrags ID lautet: ${rowsAntrag.insertId}`);
      return res.status(200).json(rowsAntrag.insertId);
    })
  });
});

//////////////////////////////////////////////////////////////////////////////////////////////////
// Dateiupload
//////////////////////////////////////////////////////////////////////////////////////////////////

// TODO: ERROR HANDLING
const diskStorageToUploads = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'server/uploads') // node app.js
    // cb(null, './immatrikulation/server/uploads') // Debugger
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + req.body.timestamp + '-' + req.body.idBenutzer + '.' + file.mimetype.split('/')[1])
  }
});

const upload = multer({
  storage: diskStorageToUploads,
});

app.post('/upload', [upload.fields([{
  name: 'passbild',
  maxCount: 1
}, {
  name: 'bildungsabschluss',
  maxCount: 1
}]), verificationMiddleware.verifyToken], (req, res) => {
  console.log(`Upload erfolgreich - Files: ${req.files.bildungsabschluss[0].filename} & ${req.files.passbild[0].filename}`);
  return res.status(200).send();
});

//////////////////////////////////////////////////////////////////////////////////////////////////
// Eingeschriebene Studiengänge auslesen
//////////////////////////////////////////////////////////////////////////////////////////////////

app.post('/eingeschriebeneStudiengange', verificationMiddleware.verifyToken, (req, res) => {

  let idBenutzer = mysql.escape(req.body.idBenutzer);

  let sqlSelect = 'g.idStudiengang,bezeichnung , a.status,idAntrag, a.idStudiengang , s.*'
  let sqlStatment = 'SELECT ' + sqlSelect + ' FROM thbnew.antrag AS a left join thbnew.status AS s ON s.idStatus = a.status left join thbnew.studiengang AS g ON g.idStudiengang = a.idStudiengang WHERE a.idBenutzerAntrag = ' + idBenutzer;

  // Datenbank auslesen
  mysql.query(sqlStatment, (err, rows) => {

    // Fehlerhandling für den SQL Query
    if (err) {
      console.log(`Auslesen eingeschrieben Studiengänge fehlgeschlagen - Die Datenbank konnte nicht ausgelesen werden - SQL Statment: ${sqlStatment}`);
      return res.status(500).send({
        msg: errorMsg
      });
    }
    res.status(200).send(rows);
    console.log(`Auslesen eingeschrieben Studiengänge erfolgreich - BenutzerId: ${req.body.idBenutzer} - eMail: ${req.body.mail}`);
  })
});


//////////////////////////////////////////////////////////////////////////////////////////////////
// Daten eines Antrags auslesen
//////////////////////////////////////////////////////////////////////////////////////////////////


app.get('/antragsDaten/:id', [verificationMiddleware.verifyToken, verificationMiddleware.verifyUserContract], (req, res) => {

  // Errorhandling - Falls keine id angegeben wurde führt es zum TypeError der den Prozess killt
  if (req.params.id === "undefined") {
    return res.status(500).send({
      msg: errorMsg
    });
  }

  let select = 'SELECT b.mail,vorname,nachname, a.*, g.bezeichnung, t.typ,subtyp,statusInformation FROM thbnew.antrag AS a ';
  let sqlStatment = select + 'left join thbnew.benutzer AS b ON a.idBenutzerAntrag = b.idBenutzer left join thbnew.studiengang AS g ON a.idStudiengang = g.idStudiengang left join thbnew.status AS t ON a.status = t.idStatus WHERE a.idAntrag = ' + mysql.escape(req.params.id);

  // Datenbank auslesen
  mysql.query(sqlStatment, (err, rows) => {

    // Fehlerhandling für den sql Querys
    if (err) {
      console.log(`Auslesen von Antragsdaten eines Benutzers fehlgeschlagen - Die Datenbank konnte nicht ausgelesen werden - SQL Statment: ${sqlStatment}`);
      return res.status(500).send({
        msg: errorMsg
      });
    }
    if (!rows.length) {
      console.log(`Auslesen von Antragsdaten eines Benutzers fehlgeschlagen - Es gibt keinen Antrag mit der id: ${req.params.id}`);
    }
    console.log(`Auslesen von Antragsdaten eines Benutzers erfolgreich - BenutzerId: ${rows[0].idBenutzerAntrag} - eMail: ${rows[0].mail}`);
    return res.status(200).json(rows[0]);
  })
});

//////////////////////////////////////////////////////////////////////////////////////////////////
// Studiengänge auslesen
// Public API
//////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/studiengaengeListe', (req, res) => {

  let sqlStatment = 'SELECT * FROM studiengang';

  // Datenbank auslesen
  mysql.query(sqlStatment, (err, rows) => {

    // Fehlerhandling für den sql Querys
    if (err) {
      console.log(`Auslesen von Studiengänge fehlgeschlagen - Die Datenbank konnte nicht ausgelesen werden - SQL Statment: ${sqlStatment}`);
      return res.status(500).send({
        msg: errorMsg
      });
    }
    console.log('Auslesen von Studiengänge erfolgreich - Keine Authentifizierung nötig');
    return res.status(200).json(rows);
  })
});

//////////////////////////////////////////////////////////////////////////////////////////////////
// Dokument eines Benutzers auslesen
// Für die Camunda Engine
//////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/dokument/:id', (req, res) => {

  let sqlStatment = 'SELECT a.idAntrag, b.bezeichnung AS bildungsabschluss, c.bezeichnung AS passbild FROM thbnew.antrag AS a left join thbnew.dokument AS b ON a.idBildungsabschluss = b.idDokument left join thbnew.dokument AS c ON a.idPassbild = c.idDokument WHERE a.idAntrag = ' + mysql.escape(req.params.id);

  // Datenbank auslesen
  mysql.query(sqlStatment, (err, row) => {
    // Fehlerhandling für den sql Querys
    if (err) {
      console.log(`Auslesen eines Dokuments von einem Benutzer fehlgeschlagen - Die Datenbank konnte nicht ausgelesen werden - SQL Statment: ${sqlStatment}`);
      return res.status(500).send({
        msg: errorMsg
      });
    }
    console.log(`Auslesen eines Dokuments von einem Benutzer erfolgreich - AntragsId: ${req.params.id}`);
    return res.sendFile(__dirname + `/uploads/${row[0].bildungsabschluss}`);
  })
});

//////////////////////////////////////////////////////////////////////////////////////////////////
// Status der Bewerbung updaten
// Für die Camunda Engine
//////////////////////////////////////////////////////////////////////////////////////////////////

app.post('/updateStatus', (req, res) => {

  let sqlStatment = 'UPDATE antrag SET status = ' + mysql.escape(req.body.status) + ' WHERE idAntrag = ' + mysql.escape(req.body.idAntrag);

  // Datenbank auslesen
  mysql.query(sqlStatment, (err, rows) => {

    // Fehlerhandling für den sql Querys
    if (err) {
      console.log(`Status Update fehlgeschlagen - Die Datenbank konnte nicht ausgelesen werden - SQL Statment: ${sqlStatment}`);
      return res.status(500).send({
        msg: errorMsg
      });
    }
    console.log('Status Update erfolgreich');
    return res.status(200).json(rows);
  })
});

//////////////////////////////////////////////////////////////////////////////////////////////////
// Listen aktivieren
//////////////////////////////////////////////////////////////////////////////////////////////////
app.listen(port, () => {
  console.log(`Server is running on port test ${port}`);
});