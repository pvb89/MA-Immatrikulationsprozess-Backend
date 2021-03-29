const config = require('../configuration/config.js');
const jwt = require("jsonwebtoken");
const mysql = require('../configuration/db.js');

// Token vom Req auslesen und als String zurückgeben
function _getTokenFromReq(req) {
  if (!req.headers.authorization) {
    console.log('Auhtentifizierung fehlgeschlagen - Kein Token im Header - Benutzer: ' + req.body.mail);
    // Status 401 Unauthorized
    return res.status(401).send({
      errorMsg: 'Es gab ein Problem bei der Authorisierung'
    });
  }
  return req.headers.authorization.split(' ')[1];
}

module.exports = {
  verifyToken: (req, res, next) => {
    let token = _getTokenFromReq(req);

    jwt.verify(token, config.jwtSecret, (err, decoded) => {
      if (err) {
        console.log('Auhtentifizierung fehlgeschlagen - Token konnte nicht verifiziert werden - Benutzer: ' + req.body.mail);
        // Status 401 Unauthorized
        return res.status(401).send({
          errorMsg: "Es gab ein Problem bei der Authorisierung"
        });
      }
      next();
    });
  },
  verifyUserContract: (req, res, next) => {
    let token = _getTokenFromReq(req);

    // Token decoden um die BenutzerId auszulesen
    var decoded = jwt.decode(token);

    // Datenbank auslesen um die BenutzerId für den Antrag zu erhalten
    let sqlStatment = 'SELECT b.idBenutzer FROM thbnew.benutzer AS b left join thbnew.antrag AS a ON b.idBenutzer = a.idBenutzerAntrag WHERE a.idAntrag = ' + mysql.escape(req.params.id);

    mysql.query(sqlStatment, (err, rows) => {
      // Fehlerhandling für den sql Querys
      if (err) {
        console.log(`Anmeldung fehlgeschlagen - Die Datenbank konnte nicht ausgelesen werden - SQL Statment: ${sqlStatment}`);
        return res.status(500).send({
          errorMsg: 'Es gab ein Problem bei der Authorisierung'
        });
      }
      // Prüfung ob der gesendete Token dem gleichen Benutzer wie der Antrag gehört
      if (decoded.idBenutzer != rows[0].idBenutzer) {
        console.log(`Authentifizierung fehgeschlagen - Der Benutzer ${decoded.idBenutzer} versucht die Daten vom Benutzer ${rows[0].idBenutzer} auszulesen`);
        return res.status(500).send({
          errorMsg: 'Es gab ein Problem bei der Authorisierung'
        });
      }
      next();
    })
  }
};

