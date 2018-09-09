require('../server/config/config');
const {mongoose} = require('../server/db/mongoose');
const { ToDo } = require('../server/models/ToDo');
const newTask = new ToDo({text:'hehe'});
ToDo.find().then(docs => {
    console.log(docs);
});
console.log('hehehe');