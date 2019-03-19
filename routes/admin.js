const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Listing = require('../models/Listing');
const bcrypt = require('bcryptjs');
const flash = require('connect-flash');
const passport = require('passport');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const { ensureAuthenticated } = require('../config/auth');
const fs = require('fs');
require('../app');




// admin login
router.get('/login', (req, res) => {
    res.render('login');
});

//login handle 
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/admin/dashboard',
        failureRedirect: '/admin/login',
        failureFlash: true
    })(req, res, next);
});

//logout handle 
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/admin/login');
});

// dashboard page
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    Listing.find({}).sort({ date: -1 }).exec((err, listings) => {
        res.render('dashboard', {listings: listings});
    })
})

// admin register page
router.get('/register', (req, res) => {
    res.render('register');
});

// add item listing page 
router.get('/addlist', ensureAuthenticated, (req, res) => {
    res.render('addlist');
});


// register post
router.post('/register', (req, res) => {
    const { name, password, password2 } = req.body;
    let errors = [];

    if(!name || !password || !password2) {
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
            password,
            password2
        });
    } else {
        User.findOne({ name: name })
        .then(user => {
            if(user) {
                errors.push({ msg: 'Email is already registerd' });
                res.render('register', {
                    errors,
                    name,
                    password,
                    password2
                });        
            } else {
                const newUser = new User({
                    name,
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
    limits: { fileSize: 100000000 },
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
}).array('myImage');

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

// submit listing handlee
router.post('/upload', ensureAuthenticated, (req, res, next) => {
    const { title, desc, whid, price } = req.body;

    if (!title) {
        req.flash('error', 'Please add a title!');
        res.redirect('back');
    } else {

        let defPhoto = ({
            path: '../public/logo.png',
        });

        let newList = new Listing({
            title: title,
            desc: desc,
            whid: whid,
            price: price,
            _id: new mongoose.Types.ObjectId()
        });

        newList.photos.push(defPhoto);
        newList.save(function(err) {
            if (err) throw err;
            res.redirect(('/admin/inventory/' + newList._id));
        });   
    };
});

// admin listing page 
router.get('/inventory/:id', ensureAuthenticated, (req, res, next) => {
    Listing.findOne({ _id: req.params.id }).exec((err, listing) => {
        if (err) throw err;
        res.render('inventory', { listing: listing });
    });
});

// add photos page
router.get('/photos/:id', ensureAuthenticated, (req, res, next) => {
    Listing.findOne({ _id: req.params.id }).exec((err, listing) => {
        if (err) throw err;
        res.render('edit', { listing: listing });
    });
});

// add photos post 
router.post('/picupload/:id', ensureAuthenticated, (req, res, next) => {
    upload(req, res, (err) => {
        if (err || !req.files) {
            if (err) throw err;
            req.flash('error', 'Incorrect file type - .jpeg, .png, .jpg, .gif only ');
            res.redirect('back');
        } else {

            Listing.findOne({ _id: req.params.id }).exec((err, listing) => {
                if (listing.photos.length > 0) {
                    if (listing.photos[0].path == '../public/logo.png') {
                        listing.photos.shift();
                    }    
                }
                
                req.files.forEach(function(file) {
                    let newPhoto = ({
                        path: ('../' + file.path)
                    });
                    listing.photos.push(newPhoto);
                });

                listing.save(function(err) {
                    if (err) throw err;
                    res.redirect(('/admin/inventory/' + listing._id));
                });
            });
        };
    });
});

// update listing
router.post('/update/:id', ensureAuthenticated, (req, res, next) => {
    const { title, desc, whid, price } = req.body;
    
    Listing.updateOne({ _id: req.params.id }, {
        title: title,
        desc: desc,
        whid: whid,
        price: price
    }, {
        new: true
    }, (err, listing) => {
        if (err) throw err;
        req.flash('success_msg', 'Listing updated!');
        res.redirect(('/admin/inventory/' + req.params.id));
    });
});

// delete listing
router.post('/deletelisting/:id', ensureAuthenticated, (req, res, next) => {
    Listing.findOne({ _id: req.params.id }).exec((err, listing) => {
        listing.photos.forEach((photo) => {
            let photoPath = photo.path.toString();
            photoPath = photoPath.replace('../', './');

            if (photoPath !== './public/logo.png') {
                fs.unlink(photoPath, (err) => {
                    if (err) throw err;
                });
            };
        });
       
        Listing.deleteOne({ _id: req.params.id }, function(err) {
            if (err) throw err;
            res.redirect('/admin/dashboard');
        });
    });
});

// delete photo 
router.post('/deletephoto/:id/:index', ensureAuthenticated, (req, res, next) => {
    Listing.findOne({ _id: req.params.id }).exec((err, listing) => {

        let phoString = listing.photos[req.params.index].path.toString();
        phoString = phoString.replace('../', './');

        fs.unlink(phoString, (err) => {
            if (err) throw err;
        });    

        listing.photos.splice(req.params.index, 1);
        listing.markModified('photos');

        listing.save(function(err) {
            if (err) throw err;
            req.flash('success_msg', 'Image deleted successfully!');
            res.redirect(('/admin/inventory/' + req.params.id));
        });
    });
});

// admin search
router.post('/dashsearch', ensureAuthenticated, (req,  res) => {
    const { title, whid } = req.body; 
    Listing.find({ $or: [{ title: new RegExp(title, 'i')}, { desc: new RegExp(title, 'i')}],  whid: new RegExp(whid, 'i')}).exec((err, listings) => {
        if (err) throw err;
        res.render('dashboard', { listings: listings });
    });
});

// search low to high
router.post('/low', ensureAuthenticated, (req,  res) => {
    Listing.find({}).sort([['price', 1]]).exec((err, listings) => {
        if (err) throw err;
        res.render('dashboard', { listings: listings });
    });
});

// search high to low
router.post('/high', ensureAuthenticated, (req,  res) => {
    Listing.find({}).sort([['price', -1]]).exec((err, listings) => {
        if (err) throw err;
        res.render('dashboard', { listings: listings });
    });
});

// search oldest
router.post('/oldest', ensureAuthenticated, (req, res) => {
    Listing.find({}).sort({ date: 1 }).exec((err, listings) => {
        res.render('dashboard', { listings: listings });
    });
});

// delete inventory listing 
router.post('/delete/:id', ensureAuthenticated, (req, res) => {
    Listing.deleteOne({ _id: req.params.id }).exec((err) => {
        req.flash('success_msg', 'Sucessfully deleted!')
        res.redirect('/admin/dashboard');
    });
});



module.exports = router;
