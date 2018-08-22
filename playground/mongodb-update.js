const { MongoClient, ObjectID } = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/ToDoApp', { useNewUrlParser: true }, (err, client) => {
    if (err) {
        return console.error(`Unable to connect to MongoDB server`);
    }
    const db = client.db('ToDoApp');
    // db.collection('Todos').findOneAndUpdate({ _id: new ObjectID("5b7cc147ca8a621628691a0b") }, { $set: { completed: true } }, { returnOriginal: false }).then(doc => {
    //     console.log(doc);
    // });
    db.collection('Users').findOneAndUpdate({_id: new ObjectID('5b7cccd992b650edb88801b1')}, {$set: {name:'Ramirez'}, $inc:{age:5}}, {returnOriginal:false}).then(doc=>{
        console.log(doc);
    })
    client.close();
});