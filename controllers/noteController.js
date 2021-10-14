const Note = require('../models/note');
const User = require('../models/user');

const PATH_PREFIX = './public/notes/'
const PATH_SUFFIX = '.txt'

const note_get = (req, res) => {
    if (req.session.user === undefined) {
        res.render('user/login', {title: 'Log in', loged_in: false, message: 'Log in before you access the notes'});
    } else {
        var reads = req.session.readperm.split(':');
        if (reads.length === 0) {
            res.render('notes/index', {title: 'Wszystkie notatki', loged_in: true, notes: []});
        } else if (reads.length > 0 && reads[0] === '') {
            res.render('notes/index', {title: 'Wszystkie notatki', loged_in: true, notes: []});
        } else {
            if (reads[reads.length-1] === '')
                reads.pop();
            const prom = new Promise(async (resolve, reject) => {
                var almost_notes = []
                for (const note of reads) {
                    const mongo_note = await Note.findById(note);
                    almost_notes.push({"id": mongo_note.id, "title": mongo_note.title.replace(PATH_PREFIX, '')});
                }
                resolve(almost_notes)
            }).then(val => {
                res.render('notes/index', {title: 'Wszystkie notatki', loged_in: true, notes: val});
            });
        }
    }
};

const note_details = (req, res) => {
    if (req.session.user === undefined) {
        res.render('user/login', {title: 'Log in', loged_in: false, message: 'Log in before you access the notes'});
    }
    const note_id = req.params.filename;
    Note.findById(note_id, (error, result) => {
        if (error) {
            console.log(error);
            res.redirect('/500');
        } else {
            res.render('notes/details', {title: result.title, loged_in: true, name: result.title, body: result.content});
            console.log(result)
        }
    });
};

const note_create_get = (req, res) => {
    if (req.session.user === undefined) {
        res.render('user/login', {title: 'Log in', loged_in: false, message: 'Log in before you access the notes'});
    }
    res.render('notes/create', {title: 'Stwórz notatkę', loged_in: true, exists: false});
};

const note_create_post = (req, res) => {
    if (req.session.user === undefined) {
        res.render('user/login', {title: 'Log in', loged_in: false, message: 'Log in before you access the notes'});
    }
    else {
        const path = PATH_PREFIX + req.body.title + PATH_SUFFIX;

        const note = new Note({
            "title": path, "content": req.body.text
        })
        note.save()
            .then(() => console.log("success"))
            .catch((error) => console.log(error));
        // update user's session
        const readperm = req.session.readperm + note._id + ":";
        const writeperm = req.session.writeperm + note._id + ":";
        const prom = new Promise(async (resolve, reject) => {
            await User.updateOne({ "login": req.session.user }, {
                "readperm": readperm, "writeperm": writeperm
            });
            resolve()
        }).then(() => {
            req.session.readperm = readperm
            req.session.writeperm = writeperm
            req.session.save(function(err) {
                res.redirect('/notes', {status: 202}, {title: 'Notes', loged_in: true})
            })
        })
    }
};

const note_delete = (req, res) => {
    Note.findByIdAndRemove(req.params.filename, function (error, result) {
        if (error) {
            console.log(error);
            res.redirect('/500');
        } else {
            console.log("deleted one record");
            res.redirect('/notes', {status: 202}, {title: 'Notes', loged_in: true});
        }
    })
};

const note_update = (req, res) => {
    Note.findByIdAndUpdate(req.body.title, function (error, result) {
        if (error) {
            console.log(error);
            res.redirect('/500');
        } else {
            console.log(req)
            result = {title: req.body.filename, content: req.body.content}
            res.redirect('/notes', {status: 202}, {title: 'Notes', loged_in: true})
        }
    })
};

module.exports = {
    note_get, note_details, note_create_get, note_create_post, note_delete, note_update
};