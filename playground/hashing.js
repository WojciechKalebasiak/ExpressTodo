const { SHA256 } = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
// const data = {
//     id: 10
// };
// const token = {
//     data,
//     hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
// };
// const resultHash = SHA256(JSON.stringify(data) + 'somesecret').toString();
// token.data.id = 4;
// token.hash = SHA256(JSON.stringify(token.data)).toString();
// if(resultHash === token.hash) {
//     console.log('Data was not changed');
// }
// else {
//     console.log('Data was changed dont trust');
// // }
// const token = jwt.sign(data, 'abc1237');
// const decoded = jwt.verify(token, 'abc1237');
// console.log(decoded);
const password = 'password';
bcrypt.genSalt(10)
    .then(salt => {
        return bcrypt.hash(password, salt)
    })
    .then(hash => {
        console.log(hash);
    })
    .catch(e => {
        console.log(e);
    });
const hashedPassword = '$2a$10$8Y0UQESJGQEOoqUN3B1hFOGMZD5YN3844KRpOAXTcwYbHxuG8xBym';
bcrypt.compare(password, hashedPassword)
    .then(res => {
        console.log(res);
    })
