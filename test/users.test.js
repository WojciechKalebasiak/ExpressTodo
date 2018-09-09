
const expect = require('chai').expect;
const request = require('supertest');
const jwt = require('jsonwebtoken');
const { ObjectID } = require('mongodb');

const { app } = require('../server/server');
const { User } = require('../server/models/User');

describe('GET /users/me', () => {
    const testID = new ObjectID();
    let testUserOne = {
        email: 'testuserone@example.com',
        password: 'testpass'
    };
    let testUserTwo = {
        email: 'testusertwo@example.com',
        password: 'anothertestpass',
        _id: testID,
        tokens: [{
            access: 'auth',
            token: jwt.sign({ _id: testID.toHexString() }, 'abc123').toString()
        }]
    }
    before(done => {
        User.deleteMany({}).then(() => {
            User.insertMany([testUserOne, testUserTwo]).then(() => {
                done();
            });
        });
    });
    it('should return user if authenticated', done => {
        const token = testUserTwo.tokens[0].token;
        request(app)
            .get('/users/me')
            .set('x-auth', token)
            .expect(200)
            .expect(res => {
                expect(res.body.email).to.equal(testUserTwo.email);
                expect(res.body._id).to.equal(testUserTwo._id.toHexString());
            })
            .end(done);
    });
    it('should not return user if not authenticated', done => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect(res => {
                expect(res.body).to.be.an('object').which.is.empty;
            })
            .end(done)
    });
});
describe('POST /users', () => {
    it('should create a user', done => {
        const email = "postTest@example.com";
        const password = 'testpassword';
        request(app)
            .post('/users')
            .send({ email, password })
            .expect(201)
            .expect(res => {
                expect(res.body.email).to.equal(email);
                expect(res.headers['x-auth']).to.exist;
                expect(res.body._id).to.exist;
            })
            .end((err, res) => {
                if (err) {
                    return done(err)
                }
                User.findById(res.body._id).then(doc => {
                    expect(doc).to.exist;
                    expect(doc.email).to.equal(email);
                    expect(doc.password).to.not.equal(password);
                    done();
                });
            });
    });
    it('should return validation errors when request is invalid', done => {
        request(app)
            .post('/users')
            .send({ email: 'invalidEmail', password: 'shrt' })
            .expect(400)
            .expect(res => {
                expect(res.error.text).to.include('is not valid email');
                expect(res.error.text).to.include('is shorter than the minimum allowed length');
                expect(res.headers['x-auth']).to.not.exist;
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                User.findOne({ email: 'invalidEmail' }).then(doc => {
                    expect(doc).to.not.exist;
                    done();
                })
            });
    });
    it('should not create user when email already in use', done => {
        //Data form first test suite
        const email = "postTest@example.com";
        const password = 'testpassword';

        request(app)
            .post('/users')
            .send({ email, password })
            .expect(400)
            .expect(res => {
                expect(res.headers['x-auth']).to.not.exist;
                expect(res.error.text).to.contain('duplicate key');
            })
            .end(done);
    });
    after(done => {
        User.deleteOne({ email: { $regex: /test/ } }).then(() => { done(); });
    });
});