const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Listing = require('../models/Listing');
const { ensureAuthenticated } = require('../config/auth');
const { isAdmin } = require('../config/isadmin');
require('../app');

// landing page, shows 4 random documents
router.get('/', (req, res) => {
    Listing.countDocuments().exec((err, allList) => {
        let randomNum = Math.floor(Math.random() * allList);
        randomNum = randomNum - Number(3);
        
        let curUser = false;

        if (req.user) {
            curUser = true; 
        };
        
        Listing.findRandom({}, {}, {limit: 6}, function(err, listings) {
            if (err) throw err;
            res.render('landing', { listings: listings, curUser: curUser });
        });
    });
});

// all listing page
router.get('/listings', (req, res) => {
    Listing.find({}).sort({ date: -1 }).exec((err, listings) => {
        res.render('listings', { listings: listings });
    });
});

// single listing page
router.get('/listings/:id', (req, res) => {
    Listing.findOne({ _id: req.params.id }).exec((err, listing) => {
        if (err) throw err;
        res.render('single', { listing: listing });
    });
});

// search post
router.post('/search', (req,  res) => {
    const { title } = req.body; 
    Listing.find({ $or: [{title: new RegExp(title, 'i')}, {desc: new RegExp(title, 'i')},   {whid: new RegExp(title, 'i')}]}).exec((err, listings) => {
        if (err) throw err;
        res.render('listings', { listings: listings });
    });
});

// search low to high
router.post('/low', (req,  res) => {
    Listing.find({}).sort([['price', 1]]).exec((err, listings) => {
        if (err) throw err;
        res.render('listings', { listings: listings });
    });
});

// search high to low
router.post('/high', (req,  res) => {
    Listing.find({}).sort([['price', -1]]).exec((err, listings) => {
        if (err) throw err;
        res.render('listings', { listings: listings });
    });
});

module.exports = router;

