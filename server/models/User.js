const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            require: true
        },
        token: {
            type: String,
            require: true
        }
    }]
});
UserSchema.methods.generateAuthToken = function () {
    const user = this;
    const access = 'auth';
    const token = jwt.sign({ _id: user._id.toHexString() }, 'abc123').toString();
    user.tokens.push({ access, token });
    return user.save().then(() => {
        return token;
    });
};
UserSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    const { email, _id } = userObject;
    return { email, _id };
};
UserSchema.methods.removeToken = function (token) {
    const user = this;
    return user.update({
        $pull: {
            tokens: {
                token
            }
        }
    })
}
UserSchema.statics.findByCredentials = function (email, password) {
    const User = this;
    return User.findOne({ email })
        .then(user => {
            if (!user) {
                return Promise.reject();
            }
            return bcrypt.compare(password, user.password)
                .then(res => new Promise((resolve, reject) => {
                    if (res) {
                        resolve(user);
                    }
                    reject();
                }));
        });
};
UserSchema.statics.findByToken = function (token) {
    const User = this;
    let decoded;
    try {
        decoded = jwt.verify(token, 'abc123');
    }
    catch (e) {
        return Promise.reject(e);
    }
    return User.findOne({ '_id': decoded._id, 'tokens.token': token, 'tokens.access': 'auth' });
};
UserSchema.pre('save', function (next) {
    const user = this;
    if (user.isModified('password')) {
        bcrypt.genSalt(10)
            .then(salt => {
                return bcrypt.hash(user.password, salt);
            })
            .then(hashedPassword => {
                user.password = hashedPassword;
                next();
            })
            .catch(e => {
                console.log(e);
            })
    }
    else {
        next();
    }
});
const User = mongoose.model('User', UserSchema);
module.exports = { User };