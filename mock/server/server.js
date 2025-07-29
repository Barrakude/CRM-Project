const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const entities = ['users', 'companies', 'contacts', 'contracts', 'tasks'];

const db = {};

//& lettura e scrittura

function loadEntity(name) {
    const file = path.join(__dirname, '..', 'data', `${name}.json`);
    db[name] = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
    console.log(`Caricato ${name}: ${db[name].length} elementi da ${file}`);
}

function saveEntity(name) {
    const file = path.join(__dirname, '..', 'data', `${name}.json`);

    fs.writeFileSync(file, JSON.stringify(db[name], null, 2), 'utf8');
}

//& carico i file all'avvio

entities.forEach(loadEntity);


//& crea il nuovo ID numerico 

function nextId(name) {
    const arr = db[name];
    return arr.length ? Math.max(...arr.map(o => o.id)) + 1 : 1;
}

//& --- Crea automaticamente le route CRUD ---
entities.forEach(name => {
    const base = `/${name}`;
    app.get(base, (req, res) => res.json(db[name]));

    app.get(`${base}/:id`, (req, res) => {
        const obj = db[name].find(o => o.id === parseInt(req.params.id));
        res.json(obj || {});
    });

    app.post(base, (req, res) => {
        const newObj = { id: nextId(name), ...req.body };
        db[name].push(newObj);
        saveEntity(name);
        res.status(201).json(newObj);
    });

    app.put(`${base}/:id`, (req, res) => {
        const id = parseInt(req.params.id);
        const idx = db[name].findIndex(o => o.id === id);
        if (idx === -1) return res.status(404).send('Not found');
        db[name][idx] = { ...db[name][idx], ...req.body, id };
        saveEntity(name);
        res.json(db[name][idx]);
    });
    
    app.delete(`${base}/:id`, (req, res) => {
        const id = parseInt(req.params.id);
        const before = db[name].length;
        db[name] = db[name].filter(o => o.id !== id);
        if (db[name].length === before) return res.status(404).send('Not found');
        saveEntity(name);
        res.status(204).send();
    });
});

app.listen(PORT, () => console.log(`Mock server running on http://localhost:${PORT}`));
