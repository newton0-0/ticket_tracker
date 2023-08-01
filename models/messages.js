const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    sender: {
        type: String,
        required: [true, 'Please Enter an E-Mail'],
        unique: true,
        lowercase: true,
    },
    message: {
        type: String,
        required: [true, 'Please Enter a message first']
    }
});

//fire a function before doc saved to db
userSchema.post('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.message = await bcrypt.hash(this.message, salt);
    next();
});

//static method to login user
userSchema.statics.login = async function(email, password) {
    const user = await this.findOne({ email });
    if(user) {
        const auth = await bcrypt.compare(password, user.password);
        if(auth) {
            return user;
        }
        throw Error('Password Incorrect');
    }
    throw Error('Incorrect email');
}

const User = mongoose.model('user', userSchema);
module.exports = User;