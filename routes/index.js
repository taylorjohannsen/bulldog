const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Listing = require('../models/Listing');
const User = require('../models/User');
const { ensureAuthenticated } = require('../config/auth');


router.get('/', (req, res) => {
    Listing.countDocuments().exec((err, allList) => {
        let randomNum = Math.floor(Math.random() * allList);

        Listing.find({}).skip(randomNum).limit(3).exec((err, listings) => {
            res.render('landing', { listings: listings });
        });
    });
});

module.exports = router;