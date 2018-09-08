require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const ObjectID = require('mongodb').ObjectID;

const { mongoose } = require('./db/mongoose');
const { User } = require('./models/User');
const { ToDo } = require('./models/ToDo');
const { authenticate } = require('./middleware/middleware');

const app = express();
app.use(bodyParser.json());
const port = process.env.PORT;
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
        res.status(400).send();
    });
});
app.delete('/todos/:id', (req, res) => {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).end();
    }
    ToDo.findByIdAndDelete(id).then(todo => {
        if (!todo) {
            return res.status(404).end();
        }
        res.status(200).send({ todo });
    }).catch(() => {
        res.status(400).end();
    });
});
app.patch('/todos/:id', (req, res) => {
    const id = req.params.id;
    const body = {
        completed: req.body.completed,
        text: req.body.text
    }
    if (!ObjectID.isValid(id)) {
        return res.status(404).end();
    }
    if (typeof body.completed === 'boolean' && body.completed) {
        body.completedAt = new Date().getTime();
    }
    else {
        body.completed = false;
        body.completedAt = null;
    }
    if (typeof body.text === 'string' && body.text.length === 0) {
        return res.status(500).send();
    }
    ToDo.findByIdAndUpdate(id, { $set: body }, { new: true }).then(todo => {
        if (!todo) {
            return res.status(404).send();
        }
        res.status(200).send({ todo });
    }).catch(() => {
        res.status(400).send();
    });
});
app.post('/users', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send();
    }
    const user = new User({ email, password });
    user.save()
        .then(user => {
            return user.generateAuthToken();
        })
        .then(token => {
            res.header('x-header', token).status(201).send(user);
        })
        .catch(e => {
            res.status(500).send(e.message);
        });
});
app.get('/users/me', authenticate, (req, res) => {
    res.status(200).send(res.locals.user);
});
app.listen(`${port}`, () => {
    console.log(`Starting at ${port}`);
});
module.exports = { app };