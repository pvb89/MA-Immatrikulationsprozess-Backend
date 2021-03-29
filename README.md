# BACKEND

## General

Digitization of matriculation process of the Technische Hochschule Brandenburg

(This repository hold the files of the backend)

![](https://i.ibb.co/qdZgG3S/Architektur.jpg)

![](https://i.ibb.co/z6wm1R6/Backend-Architektur.jpg)

### Links to releated Gits

| Plugin | README |
| ------ | ------ |
| Frontend | [github.com/pvb89/imma-frontend][frontend] |
| Camunda | [github.com/pvb89/imma-camunda][camunda] |

### Version information
| Purpose | Tool  | Version |
| ------ | ------ | ------ |
| Frontend | VueJS | 2.6.11 |
| Backend | Node | 13.0.1 |
| Database | MySQL | 8.0.19 |
| Process Automation | Camunda Engine | 7.12.0 |
| DMS | Codia D3 | Cloud Product |

## Deploy/Run:

#### Information

- You can find the databaes configuration under "ormconfig.json" and .env. You dont need to change it if you use the MySQL basic configuration and set the root password to "thb" during the installation.
- The database schema, tables and require data will be then added automaticly by the backend
- The DMS it´s only a test-version and will be closed on 04.04.2021 - Create you own with the same configuration as described in the master thesis and change the secret in .env file

#### Prerequisites

- Install [Node with NPM][nodeDL] 
- Install [MySQL Server][mysqlDL] - Please change the root password to "thb" while the installation

#### Change configuration

- All configuration parameters are under .env and .ormconfig.json
- Dont forget to update the camunda process id on the first deploy 

#### Install Packages
```
npm install
```

#### Run backend
```
npm run serve
```

#### Run backend for development
```
npm run nodemon
```

#### Ports
```
Frontend: 3000
Server: 4000
Camunda: 8080
```

#### Manuel database setup if nessasery
```
CREATE DATABASE IF NOT EXISTS IMMATRIKULATIONS_PROZESS
```

```
INSERT INTO ma.course
(id, description, subjectArea, graduation)
VALUES
(1, 'Applied Computer Science', 'Informatik und Medien', 'Bachelor'),
(2, 'Informatik', 'Informatik und Medien', 'Bachelor'),
(3, 'Medizininformatik', 'Informatik und Medien', 'Bachelor'),
(4, 'Ingenieurwissenschaften', 'Technik', 'Bachelor'),
(5, 'Wirtschaftsingenieurwesen', 'Technik', 'Bachelor'),
(6, 'Maschinenbau', 'Technik', 'Bachelor');
```
```
INSERT INTO ma.status
(id, status, description)
VALUES
(1, 'Antrag eingegangen', 'Ihr Antrag ist bei uns eingangen'),
(2, 'Dokumente prüfen', 'Ihre Unterlagen werden aktuell geprüft'),
(3, 'Dokumente fehlerhaft', 'Bitte überprüfen Sie ihre Dokumente'),
(4, 'Zahlungseingang erwartet', 'Ihr Zahlungseingang wird erwartet'),
(5, 'Immatrikuliert', 'Sie wurden erfolgreich immatrikuliert'),
(6, 'Zahlungseingang fehlerhaft' , 'Leider haben wir ihre Zahlung nicht innerhalb der Frist erhalten'),
(7, 'NC nicht erreicht', 'Sie haben den NC leider nicht erreicht');
```

 [frontend]: <https://www.github.com/pvb89/imma-frontend>
 [camunda]: <https://www.github.com/pvb89/imma-camunda>
 [mysqlDL]: <https://www.mysql.com/de/downloads/>
 [nodeDL]: <https://nodejs.org/en/download/>