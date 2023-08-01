const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please Enter an E-Mail'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid E-Mail']
    },
    password: {
        type: String,
        required: [true, 'Please Enter a password'],
        minlength: [6, 'minimum password length is 6 characters']
    }
});

//fire a function before doc saved to db
userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
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