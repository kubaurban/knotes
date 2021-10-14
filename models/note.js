const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const noteSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: String
}, {timestamps: true})

const Note  = mongoose.model('users-notes', noteSchema);

module.exports = Note;