const expect = require('chai').expect;
const request = require('supertest');

const { app } = require('../server/server');
const { ToDo } = require('../server/models/ToDo');

beforeEach(done => {
    ToDo.deleteMany().then(() => done());
});
describe('POST /todos', () => {
    it('should create a new todo', done => {
        const text = "Test";
        request(app)
            .post('/todos')
            .send({ text })
            .expect(200)
            .expect((res) => {
                expect(res.body.text).to.equal(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err)
                }
                ToDo.find().then(todos => {
                    expect(todos.length).to.equal(1);
                    expect(todos[0].text).to.equal(text);
                    done();
                }).catch(err => done(err));
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
                ToDo.find().then(todos => {
                    expect(todos.length).to.equal(0);
                    done();
                }).catch(err => done(err));
            });
    });
});