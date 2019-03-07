const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Listing = require('../models/Listing');
const User = require('../models/User');
const { ensureAuthenticated } = require('../config/auth');

router.get('/', (req, res) => {
    res.render('Welcome');
});




module.exports = router;