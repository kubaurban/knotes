const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser')
require('dotenv').config();

const app = express();
app.use('/static', express.static('./public'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// connect to database
app.use((req, res, next) => {
    const dbURI = process.env.KNOTES_MONGO_URL
    mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then((result) => { console.log("Connection established"); next(); })
        .catch((err) => console.log(err));
})

app.use(
    (req, res, next) => {
        session({
            store: new FileStore({}),
            secret: process.env.KNOTES_SECRET,
            resave: false,
            saveUninitialized: false
        })(req, res, next)
})

// use note routes
app.use('/notes', require('./routes/noteRoutes'));
app.use('/user', require('./routes/userRoutes'));

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// render index page
app.get('/', (req, res, next) => {
    console.log(req.session); // tu sesja jest undefined
    res.render('index', {title: "Strona główna", loged_in: req.session.user !== undefined});
    // req.session.user = 'x'; // to nie działa jak na razie
    // console.log(res.session);
});

// redirect to 404 page
app.use((req, res) => {
    res.status(404);
    res.render('404', {title: "Not found!", loged_in: req.session.user !== undefined});
});

// redirect to 500 page
app.use((req, res) => {
    res.status(500);
    res.render('500', {title: "Something went wrong!", loged_in: req.session.user !== undefined});
});

// listen to requests on port 8080
const port = process.env.PORT || 8080
app.listen(port);
