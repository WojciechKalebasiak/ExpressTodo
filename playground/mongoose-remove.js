const { moongose } = require('../server/db/mongoose');
const { ToDo } = require('../server/models/ToDo');
const { User } = require('../server/models/User');
const ObjectID = require('mongodb').ObjectID;
const id = '5b8460d4e34d3f089c8b48d0';
const Todo = {
    text: 'Something test'
};
// ToDo.insertMany(Todo).then((doc) => {
//     console.log(`Doc saved: \n ${doc}`);
// }, e => {
//     console.log('Unable to save your document');
// });
ToDo.findByIdAndDelete(id).then(doc => {
    console.log(`Doc deleted ${doc}`);
});

