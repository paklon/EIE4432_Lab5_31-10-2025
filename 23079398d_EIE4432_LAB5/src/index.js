// src/index.js
import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import mongostore from 'connect-mongo';
import client from './dbclient.js'; 
import login from './login.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: '23079398d_eie4432_lab5',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true },
    store: mongostore.create({
        client,
        dbName: 'lab5db',
        collectionName: 'session',
    }),
}));

app.use('/auth', login);

app.get('/', (req, res) => {
    if (req.session.logged) {
        res.redirect('/index.html'); 
    } else {
        res.redirect('/login.html'); 
    }
});

app.use('/', express.static(path.join(__dirname, '../static')));

app.listen(8080, () => {
    const currentDate = new Date().toLocaleString('en-HK', { timeZone: 'Asia/Hong_Kong' });
    console.log(`Current Date and Time in HKT: ${currentDate}`);
    console.log('Server started at http://127.0.0.1:8080');
});