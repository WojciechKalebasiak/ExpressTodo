const expect = require('chai').expect;
const request = require('supertest');
const ObjectID = require('mongodb').ObjectID;
const { app } = require('../server/server');
const { ToDo } = require('../server/models/ToDo');

describe('POST /todos', () => {
    it('should create a new todo', done => {
        const text = "Test";
        request(app)
            .post('/todos')
            .send({ text })
            .expect(201)
            .expect((res) => {
                expect(res.body.text).to.equal(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err)
                }
                ToDo.findById(res.body._id).then(doc => {
                    expect(doc.text).to.equals(text);
                    done();
                }, err => {
                    done(err);
                })
            });
    });

    it('should not create a new todo', done => {
        request(app)
            .post('/todos')
            .send()
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err)
                }
                ToDo.findById(res.body._id).then((doc) => {
                    expect(doc).to.be.null;
                    done();
                }).catch((err) => {
                    done(err);
                });
            });
    });
    after((done) => {
        ToDo.deleteOne({ text: { $regex: /Test/ } }).then(() => done());
    })
});
describe('GET /todos', () => {
    let TodosToFind;
    const ToDos = [
        {
            text: 'Some test todo',
        },
        {
            text: 'Another test todo',

        },
    ];
    before((done) => {
        ToDo.insertMany(ToDos).then(() =>
            ToDo.find({ text: { $regex: /test/ } }).then(todos => {
                TodosToFind = JSON.parse(JSON.stringify(todos));
                done();
            })
        );
    });
    it('should return all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos).to.deep.include.members(TodosToFind);
            })
            .end(done);
    });

    after((done) => {
        ToDo.deleteMany({ text: { $regex: /test/ } }).then(() => done());
    });
});
describe('GET /todos/:id', () => {
    let TodoToFind;
    const ToDoToInsert = {
        text: 'Some test todo',
    };
    before((done) => {
        ToDo.insertMany(ToDoToInsert).then(insertedTodo => {
            ToDo.findById(insertedTodo[0]._id).then(todo => {
                TodoToFind = JSON.parse(JSON.stringify(todo));
                done();
            });
        });
    });
    it('should return correct todo', (done) => {
        request(app)
            .get(`/todos/${TodoToFind._id}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).to.equal(TodoToFind.text);
            })
            .end(done);
    });
    it('should return 404 if todo not found', (done) => {
        const hexID = new ObjectID().toHexString();
        request(app)
            .get(`/todos/${hexID}`)
            .expect(404)
            .end(done);
    });
    it('should not return correct when id is not correct', (done) => {
        request(app)
            .get(`/todos/123`)
            .expect(404)
            .end(done);
    });

    after((done) => {
        ToDo.deleteMany({ text: { $regex: /test/ } }).then(() => done());
    });
});