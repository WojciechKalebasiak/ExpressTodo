const expect = require('chai').expect;
const request = require('supertest');

const { app } = require('../server/server');
const { ToDo } = require('../server/models/ToDo');

describe('POST /todos', () => {
    it('should create a new todo', done => {
        const text = "Test";Z
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
    before((done) => {
        const ToDos = [
            {
                text: 'Some test todo'
            },
            {
                text: 'Another test todo'
            }
        ]
        ToDo.insertMany(ToDos).then(() => done());
    });
    it('should return all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos).to.includes(ToDos);
            })
            .end(done);
    });

    after((done) => {
        ToDo.deleteMany({ text: { $regex: /test/ } }).then(() => done());
    })
})