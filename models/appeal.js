const mongoose = require('mongoose');

const appSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please Enter a title'],
    },
    message: {
        type: String,
        required: [true, 'Please Enter a message first']
    },
    student: {
        type: String,
        required: [true]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Appeal = mongoose.model('Appeal', appSchema);
module.exports = Appeal;