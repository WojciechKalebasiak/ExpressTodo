const { ObjectID } = require('mongodb');
const { ToDo } = require('../../server/models/ToDo');
const { User } = require('../../server/models/User');
const jwt = require('jsonwebtoken');
const userOneID = new ObjectID();
const userTwoID = new ObjectID();

const users = [
    {
        _id: userOneID,
        email: 'testemail@example.com',
        password: 'abc123',
        tokens: [
            {
                access: 'auth',
                token: jwt.sign({ _id: userOneID, access: 'auth' }, 'abc123').toString()
            }
        ]
    },
    {
        _id: userTwoID,
        email: 'testemailnumber2@example.com',
        password: 'abc123',
        tokens: [
            {
                access: 'auth',
                token: jwt.sign({ _id: userTwoID, access: 'auth' }, 'abc123').toString()
            }
        ]
    }
]
const populateUsers = done => {
    User.deleteMany({}).then(() => {
        const userOne = new User(users[0]).save();
        const userTwo = new User(users[1]).save();
        return Promise.all([userOne, userTwo]).then(() => {
        }).then(() => done());
    })

}
const todos = [
    {
        _id: new ObjectID(),
        text: 'First test todo',
        _creator: users[0]._id
    },
    {
        _id: new ObjectID(),
        text: 'Another test todo',
        completed: true,
        completedAt: 540,
        _creator: users[1]._id
    }
];
const populateTodos = done => {
    ToDo.deleteMany({}).then(() => {
        return ToDo.insertMany(todos);
    }).then(() => done());
};
module.exports = {
    todos,
    populateTodos,
    populateUsers,
    users
}