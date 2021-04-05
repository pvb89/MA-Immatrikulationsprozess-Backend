import "reflect-metadata";
import { Application } from "express";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as dotenv from 'dotenv';
import * as cors from 'cors';
import InitialDataService from "./services/InitialDataService";
import * as swaggerUi from 'swagger-ui-express';
import { routes } from './routes/index';
import { middleware } from './middleware/errorHandler';
import YAML = require('yamljs');

// Datenbank Schema erstellen und Initialdaten laden
const initialService = InitialDataService.Instance();
initialService.create()

// load enviroment variables
dotenv.config()

// create express app
const app: Application = express();

// enable Cors all and parse incoming bodys
app.use(bodyParser.json());
app.use(cors());

// create Swagger instance and bind it to a Route
console.log("__dirname", __dirname)
const swaggerDocument = YAML.load('C:/Users/admin/Desktop/Masterarbeit/Entwicklung/imma-backend/swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// create routes
app.use('/api', routes);
app.get('/health', (req, res) => res.json({ status: true, message: 'Health OK!' }));

// handle errors (after routes)
app.use(middleware.handleRequestError);

// start express server
app.listen(process.env.PORT || process.env.LOCAL_PORT, () => {
    console.log(`App running on Port ${process.env.PORT || process.env.LOCAL_PORT}`);
  })
