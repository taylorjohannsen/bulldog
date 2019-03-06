const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Listing = require('../models/Listing');
const User = require('../models/User');
const { ensureAuthenticated } = require('../config/auth');

router.get('/', (req, res) => {
    res.render('Welcome');
});

router.get('/dashboard', ensureAuthenticated, (req, res) => {
    Listing.find({}).populate('photos.path').sort({ date: -1 }).exec((err, listings) => {
        res.render('dashboard', {listings: listings});
    })
})


module.exports = router;