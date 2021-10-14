const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    login: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    readperm: {
        type: String
    },
    writeperm: {
        type: String
    },

}, { timestamps: true })

const User = mongoose.model('users', userSchema);

module.exports = User;