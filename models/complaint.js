const mongoose = require('mongoose');

const compSchema = new mongoose.Schema({
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
    mentor: {
        type: String,
        required: [true]
    },
    remark: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    stage: {
        type: String,
        required: true
    },
    appeal_id: {
        type: String,
        required: true,
        unique : true
    }
});

const Complaint = mongoose.model('Complaint', compSchema);
module.exports = Complaint;