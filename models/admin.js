const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please Enter an E-Mail'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please Enter a password'],
        minlength: [6, 'minimum password length is 6 characters']
    }
});

//fire a function before doc saved to db
adminSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

//static method to login user
adminSchema.statics.login = async function(email, password) {
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

const Admin = mongoose.model('admin', adminSchema);
module.exports = Admin;