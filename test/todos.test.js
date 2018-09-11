
const expect = require('chai').expect;
const request = require('supertest');
const ObjectID = require('mongodb').ObjectID;

const { app } = require('../server/server');
const { ToDo } = require('../server/models/ToDo');
const { todos, populateTodos, users, populateUsers } = require('./seed/seed');

beforeEach(populateTodos);
beforeEach(populateUsers);

describe('POST /todos', () => {
    it('should create a new todo', done => {
        const text = "Test";
        request(app)
            .post('/todos')
            .send({ text })
            .set('x-auth', users[1].tokens[0].token)
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
                });
            });
    });

    it('should not create a new todo', done => {
        request(app)
            .post('/todos')
            .send()
            .set('x-auth', users[1].tokens[0].token)
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
});
describe('GET /todos', () => {
    it('should return all todos', (done) => {
        request(app)
            .get('/todos')
            .set('x-auth', users[1].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).to.equal(1);
            })
            .end(done);
    });
});
describe('GET /todos/:id', () => {
    it('should return correct todo', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).to.equal(todos[0].text);
            })
            .end(done);
    });
    it('should not return todo created by other user', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .set('x-auth', users[1].tokens[0].token)
            .expect(404)
            .end(done);
    });
    it('should return 404 if todo not found', (done) => {
        const hexID = new ObjectID().toHexString();
        request(app)
            .get(`/todos/${hexID}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });
    it('should not return correct when id is not correct', (done) => {
        request(app)
            .get(`/todos/123`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

});
describe('DELETE /todos/:id', () => {
    it('should delete correct document', (done) => {
        request(app)
            .delete(`/todos/${todos[0]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).to.equal(todos[0]._id.toHexString());
                expect(res.body.todo.text).to.equal(todos[0].text);
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
    it('should not delete document created by other user', (done) => {
        request(app)
            .delete(`/todos/${todos[1]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                ToDo.findById(todos[1]._id).then(todo => {
                    expect(todo).to.exist;
                    done();
                }, e => done(e));
            });
    });
    it('should return correct todo', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).to.equal(todos[0].text);
            })
            .end(done);
    });
    it('should\'nt delete anything if no document found', (done) => {
        request(app)
            .delete(`/todos/${new ObjectID().toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done)
    });
    it('should\'nt delete if ID is malformed', (done) => {
        request(app)
            .delete(`/todos/123abc`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done)
    });
});
describe('PATCH /todos/:id', () => {
    it('should update todo', done => {
        request(app)
            .patch(`/todos/${todos[0]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .send({ text: 'should be updated', completed: true })
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).to.be.equal('should be updated');
                expect(res.body.todo.completed).to.be.true;
                expect(res.body.completedAt).to.be.a(Number);
            })
            .end((err, res) => {
                ToDo.findById(todos[0]._id).then(doc => {
                    expect(doc.text).to.be.equal(res.body.todo.text);
                    done();
                }, err => {
                    done(err);
                });
            });
    });
    it('should not update todo created by other user', done => {
        request(app)
            .patch(`/todos/${todos[0]._id.toHexString()}`)
            .set('x-auth', users[1].tokens[0].token)
            .send({ text: 'should be updated', completed: true })
            .expect(404)
            .end(done)
    });
    it('should clear completedAt when todo is not completed', done => {
        request(app)
            .patch(`/todos/${todos[1]._id.toHexString()}`)
            .set('x-auth', users[1].tokens[0].token)
            .send({ text: "should be updated", completed: false })
            .expect(200)
            .expect(res => {
                expect(res.body.text).to.be.equal('should be updated');
                expect(res.body.completed).to.be.false;
                expect(res.body.completedAt).to.not.exist;
            })
            .end((err, res) => {
                ToDo.findById(todos[1]._id).then(doc => {
                    expect(doc.text).to.equal('should be updated');
                    expect(doc.completed).to.be.false;
                    expect(doc.completedAt).to.not.exist;
                    done();
                }).catch(e => {
                    done(e);
                })
            })
    });
});
