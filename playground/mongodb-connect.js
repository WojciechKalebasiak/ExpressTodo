const { MongoClient, ObjectID } = require('mongodb');

const obj = new ObjectID();
console.log(obj);
MongoClient.connect('mongodb://localhost:27017/ToDoApp', { useNewUrlParser: true }, (err, client) => {
    if (err) {
        return console.error(`Unable to connect to MongoDB server`);
    }
    console.log('Connected to MongoDB server');
    // const db = client.db('ToDoApp')
    // db.collection('Todos').insertOne({text:'Something to do'}, (err, result) => {
    //     if (err) {
    //         return console.error(`Unable to insert Todo`, err);
    //     }
    //     console.log(JSON.stringify(result.ops, undefined, 2));
    // });
    // db.collection('Users').insertOne({ name: 'Wojtek', age: 25, location: 'Poznan' }, (err, result) => {
    //     if (err) {
    //         return console.error(`Unable to insert User`, err);
    //     }
    //     console.log(JSON.stringify(result.ops, undefined, 2));
    // });
    client.close();
});