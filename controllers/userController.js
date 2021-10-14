const User = require('../models/user');
const sha256 = require('js-sha256').sha256;
// const session = require('express-session');

const user_register_get = (req, res) => {
    if (!req.session.user) {
        res.render('user/register', {title: 'Register', loged_in: false, message: 'Create your account'});
    }
    res.redirect('/', {status: 200}, {title: 'Knotes', loged_in: true});
}

const user_register_post = (req, res) => {
    let login = req.body.login;
    let password = req.body.password;
    let password2 = req.body.password_repeated;
    if (login.length === 0) {
        res.render('user/register', {title: 'Register', loged_in: false, message: 'Login field cannot be empty'})
    } else if (password.length === 0 || password2.length === 0 || password !== password2) {
        res.render('user/register', {title: 'Register', loged_in: false, message: 'Password fields must be nonempty and must mach'})
    } else {
        User.findOne({"login": login}, function (err, retusr) {
            if (err) {
                console.log(err);
                res.render('user/register', {title: 'Register', loged_in: false, message: 'Problem during registeration'});
            }
            console.log(retusr)
            if (retusr === null) {
                const user = new User({
                    "login": login, "password": sha256(password), "readperm": "", "writeperm": ""
                });
                user.save()
                    .then((result) => console.log("success"))
                    .catch((err) => console.log(err));
                // session start
                req.session.user = login;
                req.session.readperm = "";
                req.session.writeperm = "";
                res.redirect('/', {status: 200}, {title: 'Knotes', loged_in: true});
            } else {
                res.render('user/register', {title: 'Register', loged_in: false, message: 'Such user already exists'});
            }
        });
        // if(User.findOne({login:login})){

        // }
    }
}

const user_login_get = (req, res) => {
    if (!req.session.user) {
        res.render('user/login', {title: 'Log In', loged_in: false, message: 'Log In'});
    }
    res.redirect('/', {status: 200}, {title: 'Knotes', loged_in: true});
}

const user_login_post = (req, res) => {
    let login = req.body.login;
    let password = sha256(req.body.password);
    User.findOne({"login": login, "password": password}, function (err, retusr) {
        if (err) {
            console.log(err);
            res.render('user/login', {title: 'Log In', loged_in: false, message: 'Problem during login'});
        }
        console.log(retusr)
        if (retusr === null) {
            res.render('user/login', {
                title: 'Log In',
                loged_in: false,
                message: 'Entered credentials do not match any in the database'
            });
        } else {
            req.session.user = retusr.login;
            req.session.readperm = retusr.readperm;
            req.session.writeperm = retusr.writeperm;
            res.redirect('/', {status: 200}, {title: 'Knotes', loged_in: true});
        }

    });
}

const user_logout_get = (req, res) => {
    req.session.destroy();
    res.redirect('/', {status: 200}, {title: 'Knotes', loged_in: true});
}

module.exports = {
    user_login_get, user_login_post, user_register_get, user_register_post, user_logout_get
};