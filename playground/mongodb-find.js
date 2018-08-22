const { MongoClient, ObjectID } = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/ToDoApp', { useNewUrlParser: true }, (err, client) => {
    if (err) {
        return console.error(`Unable to connect to MongoDB server`);
    }
    console.log('Connected to MongoDB server');
    const db = client.db('ToDoApp');
    db.collection('Users').find({ name:'Wojtek'}).toArray().then(result => {
        console.log(JSON.stringify(result, undefined, 2));
    })
    client.close();
});