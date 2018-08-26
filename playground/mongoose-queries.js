const { moongose } = require('../server/db/mongoose');
const { ToDo } = require('../server/models/ToDo');
const { User } = require('../server/models/User');
const ObjectID = require('mongodb').ObjectID;
const id = "5b7ed00ad3a0162bd84e05d4";
const userID = '5b7e92d811f5e908d8f0e8841111';
if (!ObjectID.isValid(userID)) {
    console.log('ID not valid');
}
// ToDo.find({ completed: false }).then(docs => {
//     console.log(`Find ${docs}`);
// });
// ToDo.findOne({ completed: false }).then(doc => {
//     console.log(`Find one: ${doc}`);
// });
// ToDo.findById(id).then(doc => {
//     if (doc)
//         console.log(`Find by id: ${doc}`);
//     else {
//         console.log(`${id} found`);
//     }
// }).catch(e => {
//     console.log(e);
// });
User.findById(userID).then(doc => {
    if (doc) {
        console.log(`User found: ${doc}`);
    }
    else {
        console.log('No user found');
    }
}).catch(e => {
    console.log(e.message);
})