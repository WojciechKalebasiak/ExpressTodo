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
describe('DELETE /todos/:id', () => {
    let TodoToDelete;
    const ToDoToInsert = {
        text: 'Some test todo',
    }
    before((done) => {
        ToDo.insertMany(ToDoToInsert).then(insertedTodo => {
            ToDo.findById(insertedTodo[0]._id).then(todo => {
                TodoToDelete = JSON.parse(JSON.stringify(todo));
                done();
            });
        });
    });
    it('should delete correct document', (done) => {
        request(app)
            .delete(`/todos/${TodoToDelete._id}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo).to.eql(TodoToDelete);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                ToDo.findById(res.body.todo._id).then(todo => {
                    expect(todo).to.not.exist;
                    done();
                }, e => done(e));
            });
    });
    it('should\'nt delete anything if no document found', (done) => {
        request(app)
            .delete(`/todos/${new ObjectID().toHexString()}`)
            .expect(404)
            .end(done)
    });
    it('should\'nt delete if ID is malformed', (done) => {
        request(app)
            .delete(`/todos/123abc`)
            .expect(404)
            .end(done)
    });
});
describe('PATCH /todos/:id', () => {
    let notCompletedTodo = {
        text: 'test not completed todo'
    };
    let completedTodo = {
        text: "test completed todo",
        completed: true,
        completedAt:333
    };
    before((done) => {
        ToDo.insertMany([completedTodo, notCompletedTodo]).then(docs => {
            completedTodo = docs[0];
            notCompletedTodo = docs[1];
            done();
        }).catch(e => {
            done(e);
        });
    });
    it('should update todo', done => {
        request(app)
            .patch(`/todos/${notCompletedTodo._id.toHexString()}`)
            .send({ text: 'notCompleted test todo', completed: true })
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).to.be.equal('notCompleted test todo');
                expect(res.body.todo.completed).to.be.true;
                expect(res.body.completedAt).to.be.a(Number);
            })
            .end((err, res) => {
                ToDo.findById(notCompletedTodo._id).then(doc => {
                    expect(doc.text).to.be.equal(res.body.todo.text);
                    done();
                }, err => {
                    done(err);
                });
            });
    });
    it('should clear completedAt when todo is not completed', done => {
        request(app)
            .patch(`/todos/${completedTodo._id.toHexString()}`)
            .send({ text: "completed test todo", completed: false })
            .expect(200)
            .expect(res => {
                expect(res.body.text).to.be.equal('completed test todo');
                expect(res.body.completed).to.be.false;
                expect(res.body.completedAt).to.not.exist;
            })
            .end((err, res) => {
                ToDo.findById(completedTodo._id).then(doc => {
                    expect(doc.text).to.equal('completed test todo');
                    expect(doc.completed).to.be.false;
                    expect(doc.completedAt).to.not.exist;
                    done();
                }).catch(e => {
                    done(e);
                })
            })
    });
    after((done) => {
        ToDo.deleteMany({ text: /test/ }).then(() => done()).catch(e=>done(e));
    });
});
