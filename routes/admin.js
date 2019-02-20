const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const flash = require('connect-flash');
const passport = require('passport');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const { ensureAuthenticated } = require('../config/auth');
require('../app');

// admin login
router.get('/login', (req, res) => {
    res.render('login');
});

// admin register page
router.get('/register', ensureAuthenticated, (req, res) => {
    res.render('register');
});

// register post
router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    if(!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    if(password !== password2) {
        errors.push({ msg: 'Passwords do not match'});
    }

    if(password.length < 6) {
        errors.push({ msg: 'Password should be at least 6 characters'});
    }

    if(errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        User.findOne({ email: email })
        .then(user => {
            if(user) {
                errors.push({ msg: 'Email is already registerd' });
                res.render('register', {
                    errors,
                    name,
                    email,
                    password,
                    password2
                });        
            } else {
                const newUser = new User({
                    name,
                    email,
                    password
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        newUser.password = hash;
                        newUser.save()
                        .then(user => {
                            req.flash('success_msg', 'You are now registered and can login');
                            res.redirect('/admin/login');
                        })
                        .catch(err => console.log(err));
                    })
                })
            }
        });
    }
});

// multer setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/pictures')
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 },
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
}).single('myImage');

function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error - Images Only!');
    }
}

// submit photo handle
router.post('/upload', (req, res, next) => {
    upload(req, res, (err) => {
        if (err || !req.file) {
            req.flash('photoerror', 'Incorrect file type - .jpeg, .png, .jpg, .gif only ');
            res.redirect('back');
        } else {
            User.updateOne({ _id: req.user.id }, {
                image: ('../' + req.file.path)
            }, { new: true }, (err, user) => {
                if (err) throw err;
                req.flash('photosuccess', 'Photo uploaded successfully!');
                res.redirect('/profile/' + req.user.id);
            });    
        }
    });
});

//login handle 
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/admin/login',
        failureFlash: true
    })(req, res, next);
});

//logout handle 
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/admin/login');
})

module.exports = router;