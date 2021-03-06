
const expect = require('chai').expect;
const request = require('supertest');
const jwt = require('jsonwebtoken');
const { ObjectID } = require('mongodb');

const { app } = require('../server/server');
const { User } = require('../server/models/User');
const { users, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);
describe('GET /users/me', () => {
    it('should return user if authenticated', done => {
        const token = users[1].tokens[0].token;
        request(app)
            .get('/users/me')
            .set('x-auth', token)
            .expect(200)
            .expect(res => {
                expect(res.body.email).to.equal(users[1].email);
                expect(res.body._id).to.equal(users[1]._id.toHexString());
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
        const email = users[0].email;
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
describe('POST /users/login', done => {
    it('should login if correct password sent', done => {
        const testCredentials = { email: users[1].email, password: 'abc123' };
        request(app)
            .post('/users/login')
            .send(testCredentials)
            .expect(200)
            .expect(res => {
                expect(res.body.email).to.equal(testCredentials.email);
                expect(res.body._id).to.equal(users[1]._id.toHexString());
                expect(res.headers['x-auth']).to.exist;
            })
            .end((err, res) => {
                if (err) {
                    return done(err)
                }
                User.findById(users[1]._id)
                    .then(user => {
                        expect(user.tokens[1]).to.deep.include({ token: res.headers['x-auth'] });
                        expect(user.tokens.length).to.equal(2);
                        expect(user.password).to.not.equal(testCredentials.password);
                        done();
                    })
                    .catch(err => {
                        done(err);
                    })
            });
    });
    it('should reject if wrong password sent', done => {
        request(app)
            .post('/users/login')
            .send({ email: users[0].email, password: 'wrongpassword' })
            .expect(400)
            .expect(res => {
                expect(res.headers['x-auth']).to.not.exist;
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                User.findById(users[0]._id).then((user) => {
                    expect(user.tokens.length).to.equal(1);
                    done();
                }).catch(e => {
                    done(e);
                });
            });
    });
});
describe('DELETE /users/me/token', () => {
    it('should remove auth token on logout', done => {
        request(app)
            .delete('/users/me/token')
            .set('x-auth', users[1].tokens[0].token)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                User.findById(users[1]._id).then(user => {
                    expect(user.tokens.length).to.equal(0);
                    done();
                });
            });
    });
});