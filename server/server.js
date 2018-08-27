const express = require('express');
const bodyParser = require('body-parser');
const ObjectID = require('mongodb').ObjectID;

const { mongoose } = require('./db/mongoose');
const { User } = require('./models/User');
const { ToDo } = require('./models/ToDo');

const PORT = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    const newTask = new ToDo({ text: req.body.text });
    newTask.save().then((doc) => {
        res.status(201).send(doc)
    }).catch((err) => {
        res.status(400).send(err);
    });
});
app.get('/todos', (req, res) => {
    ToDo.find().then(todos => {
        res.status(200).send({ todos });
    }, e => {
        res.status(400).send(e);
    });
});
app.get('/todos/:id', (req, res) => {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    ToDo.findById(id).then(todo => {
        if (!todo) {
            return res.status(404).send();
        }
        else {
            res.status(200).send({ todo });
        }
    }).catch(e => {
        res.status(404).send();
    });
});
app.listen(`${PORT}`, () => {
    console.log(`Starting at ${PORT}`);
});
module.exports = { app };