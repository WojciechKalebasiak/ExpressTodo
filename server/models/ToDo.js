const mongoose = require('mongoose');
const ToDoSchema = mongoose.Schema({
    text: {
        type: String,
        required: true,
        minlenght: 1,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Number,
        default: null
    }
});
const ToDo = mongoose.model('Todo', ToDoSchema);
module.exports = {ToDo};