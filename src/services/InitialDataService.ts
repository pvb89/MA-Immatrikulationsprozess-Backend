import * as mysql from 'mysql'
import { createConnection } from "typeorm";

class InitialDataService {

    static instance: InitialDataService;
    private connection;
    private dbName = process.env.DB_NAME

    constructor() {
        this.connection = mysql.createConnection({
            host: "pvb-database.mysql.database.azure.com",
            user: "pvb@pvb-database",
            password: "AzureDB@2021",
            ssl: {
                rejectUnauthorized: false
            }
        });
        this.connection.connect((err) => {
            if (err) throw err;
        });
    }

    // Singelton Instanz
    static Instance() {
        if (InitialDataService.instance == undefined) {
            InitialDataService.instance = new InitialDataService();
        }
        return InitialDataService.instance;
    }

    async create() {
        await this.connection.query("CREATE DATABASE IF NOT EXISTS " + this.dbName, async () => {
            await createConnection().then(()=> {
                this.loadInitialData();
            });
        });
    }

    async loadInitialData() {
        // Studiengänge speichern
        await this.connection.query('SELECT id FROM ' + this.dbName + '.course LIMIT 1', async (err, result) => {
            if (err) throw err;
            if (result.length <= 0) {
                let queryCourse = "INSERT INTO " + this.dbName + ".course (id, description, subjectArea, graduation) VALUES (1, 'Applied Computer Science', 'Informatik und Medien', 'Bachelor'),(2, 'Informatik', 'Informatik und Medien', 'Bachelor'),(3, 'Medizininformatik', 'Informatik und Medien', 'Bachelor'),(4, 'Ingenieurwissenschaften', 'Technik', 'Bachelor'),(5, 'Wirtschaftsingenieurwesen', 'Technik', 'Bachelor'),(6, 'Maschinenbau', 'Technik', 'Bachelor')"
                this.connection.query(queryCourse);
            }
        });

        // Status speichern
        await this.connection.query('SELECT id FROM ' + this.dbName + '.status LIMIT 1', async (err,result) => {
            if (err) throw err;
            if (result.length <= 0) {
                let queryCourse = "INSERT INTO " + this.dbName + ".status (id, status, description) VALUES (1, 'Antrag eingegangen', 'Ihr Antrag ist bei uns eingangen'), (2, 'Dokumente prüfen', 'Ihre Unterlagen werden aktuell geprüft'), (3, 'Dokumente fehlerhaft', 'Bitte überprüfen Sie ihre Dokumente'),(4, 'Zahlungseingang erwartet', 'Ihr Zahlungseingang wird erwartet'),(5, 'Immatrikuliert', 'Sie wurden erfolgreich immatrikuliert'),(6, 'Zahlungseingang fehlerhaft' , 'Leider haben wir ihre Zahlung nicht innerhalb der Frist erhalten'),(7, 'NC nicht erreicht', 'Sie haben den NC leider nicht erreicht')"
                this.connection.query(queryCourse);
            }
        });

        // Admin speichern
        await this.connection.query('SELECT id FROM ' + this.dbName + '.user LIMIT 1', async (err,result) => {
            if (err) throw err;
            if (result.length <= 0) {
                let queryCourse = "INSERT INTO " + this.dbName + ".user (id, mail, password, admin, firstname, lastname) VALUES (1, 'admin@admin.de', '$2b$08$pN1sFm3SnO8T4ayF0t/ZKe5qtsUcZ3CMVDkw0eEMphgse/On6bY6u', true, 'Admin', '')";
                this.connection.query(queryCourse);
            }
        });

    }
}

export default InitialDataService;