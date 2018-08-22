const { MongoClient, ObjectID } = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/ToDoApp', { useNewUrlParser: true }, (err, client) => {
    if (err) {
        return console.error(`Unable to connect to MongoDB server`);
    }
    const db = client.db('ToDoApp');
    db.collection('Users').deleteMany({ name: 'Wojtek' }).then(res => {
        console.log(res.result)
    });
    db.collection('Users').findOneAndDelete({ _id: new ObjectID('5b7ccced92b650edb88801b9') }).then(doc => {
        console.log(doc);
    })
    client.close();
});