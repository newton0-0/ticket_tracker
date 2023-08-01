const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    mentor: {
        type: String,
        required: [true, 'Please Enter an E-Mail']
    },
    stage: {
        type: Int16Array,
        required: [true, 'Please specify stage']
    },
    criticality: {
        type: String
    }
});

const User = mongoose.model('user', userSchema);
module.exports = User;