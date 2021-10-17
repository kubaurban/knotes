const { mongo } = require('mongoose');
const Note = require('../models/note');
const User = require('../models/user');

const PATH_PREFIX = './public/notes/'
const PATH_SUFFIX = '.txt'

const previewLength = 300;

const note_get = (req, res) => {
    console.log('note_get', req.body.query);
    if (req.session.user === undefined) {
        res.render('user/login', { title: 'Log in', loged_in: false, message: 'Log in before you access the notes' });
    } else {
        var reads = req.session.readperm.split(':');
        console.log(reads);
        if (reads.length === 0) {
            res.render('notes/index', { title: 'Wszystkie notatki', loged_in: true, notes: [] });
        } else if (reads.length > 0 && reads[0] === '') {
            res.render('notes/index', { title: 'Wszystkie notatki', loged_in: true, notes: [] });
        } else {
            if (reads[reads.length - 1] === '')
                reads.pop();
            const prom = new Promise(async (resolve, reject) => {
                var almost_notes = []
                for (const note of reads) {
                    const mongo_note = await Note.findById(note);
                    if (mongo_note !== null) {

                        let content = mongo_note.content;
                        if (content.length > previewLength) content = content.substring(0, previewLength) + '...';

                        almost_notes.push({
                            "id": mongo_note.id,
                            "title": mongo_note.title.replace(PATH_PREFIX, ''),
                            "content": content
                        });
                    } else {
                        console.log("Weszlismy w dupe");
                    }
                }
                resolve(almost_notes)
            }).then(val => {
                res.render('notes/index', { title: 'Wszystkie notatki', loged_in: true, notes: val });
            });
        }
    }
};

const note_details = (req, res) => {
    console.log('note_details')
    if (req.session.user === undefined) {
        res.render('user/login', { title: 'Log in', loged_in: false, message: 'Log in before you access the notes' });
    }
    const note_id = req.params.filename;
    Note.findById(note_id, (error, result) => {
        if (error) {
            console.log(error);
            res.redirect('/500');
        } else {
            res.render('notes/details', { title: result.title, loged_in: true, name: result.title, body: result.content });
            console.log(result)
        }
    });
};

const note_create_get = (req, res) => {
    if (req.session.user === undefined) {
        res.render('user/login', { title: 'Log in', loged_in: false, message: 'Log in before you access the notes' });
    }
    res.render('notes/create', { title: 'Stwórz notatkę', loged_in: true, exists: false });
};

const note_create_post = (req, res) => {
    if (req.session.user === undefined) {
        res.render('user/login', { title: 'Log in', loged_in: false, message: 'Log in before you access the notes' });
    }
    else {
        const title = req.body.title;
        const path = PATH_PREFIX + title + PATH_SUFFIX;

        // wyszukac note o tej samej nazwie
        Note.findOne({ "title": title }, (err, note) => {
            console.log('notatka o tej samej nazwie:', note);

            if (note) {
                res.render('notes/create', {
                    title: 'aaaaaa',
                    loged_in: true,
                    exists: true
                });
            } else {
                const note = new Note({
                    "title": title, "content": req.body.text
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
                    req.session.save(function (err) {
                        if (err) console.log('ASDASDASDA', err);
                        console.log("PrzedC");
                        res.redirect('/notes', { status: 202 }, { title: 'Notes', loged_in: true });
                        console.log("PoC");
                    })
                })
            }
        });
    }
};

const note_delete = (req, res) => {
    Note.findByIdAndRemove(req.params.filename, function (error, result) {
        if (error) {
            console.log(error);
            res.redirect('/500');
        } else {
            console.log("deleted one record");

            const readperm = req.session.readperm.replace(req.params.filename + ":", "");
            const writeperm = req.session.writeperm.replace(req.params.filename + ":", "");
            const prom = new Promise(async (resolve, reject) => {
                await User.updateOne({ "login": req.session.user }, {
                    "readperm": readperm, "writeperm": writeperm
                });
                resolve()
            }).then(async () => {
                req.session.readperm = readperm
                req.session.writeperm = writeperm
                await req.session.save(function (err) {
                    if (err) console.log(err);
                })
                console.log("Przed");
                res.json({ redirect: '/notes', loged_in: true });
                //res.redirect('/', {status: 202}, {title: 'Notes', loged_in: true});
                console.log("Po");
            })
            console.log("PoPo");
        }
    })
};

const note_update = (req, res) => {
    console.log('node_update', req.body, ' <- req')
    // Note.replaceOne({"_id": "616a1450095557290f97fefb"}, {"content": "DUPA"})
    Note.findByIdAndUpdate(req.body.id, req.body, (error, result) => {
        console.log('findbyidandupdate callback')
        if (error) {
            console.log(error);
            res.redirect('/500');
        } else {
            // console.log(req)
            console.log('findbyidandupdate callback else')
            // result = {title: req.body.title, content: req.body.content}
            res.json({ redirect: '/notes', loged_in: true });
            // res.redirect('/notes', {status: 202}, {title: 'Notes', loged_in: true});
        }
    })
};

const note_search = (req, res) => {
    console.log('note_search', req.body.query)

    Note.find({
        '$or': [
            {
                'title': {
                    '$regex': req.body.query
                }
            },
            {
                'content': {
                    '$regex': req.body.query
                }
            }
        ]
    }, function (error, result) {
        if (error) {
            console.log(error);
            res.redirect('/500');
        } else {
            // console.log(result);

            result.forEach(element => {
                let content = element.content;
                if (content.length > previewLength) element.content = content.substring(0, previewLength) + '...';
            });

            res.render('notes/index', { title: 'Wszystkie notatki', loged_in: true, notes: result });


            // const almost_notes = [];

            // result.forEach(mongo_note => {
            //     almost_notes.push({
            //         "id": mongo_note.id,
            //         "title": mongo_note.title,
            //         "content": mongo_note.content
            //     });
            // });

            // console.log(almost_notes)

            // res.render('notes/index', { title: 'Wszystkie notatki', loged_in: true, notes: almost_notes });
        }
    })
};

module.exports = {
    note_get, note_details, note_create_get, note_create_post, note_delete, note_update, note_search
};

