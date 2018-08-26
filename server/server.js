const express = require('express');
const bodyParser = require('body-parser');

const { mongoose } = require('./db/mongoose');
const { User } = require('./models/User');
const { ToDo } = require('./models/ToDo');

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
})
app.listen(3000, () => {
    console.log('Starting at http://localhost:3000');
});
module.exports = { app };