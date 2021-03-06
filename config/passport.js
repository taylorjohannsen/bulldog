const LocalStrategy = require('passport-local');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load User Model
const User = require('../models/User');

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({
            usernameField: 'name'
        }, (name, password, done) => {
            User.findOne({ name: name })
                .then(user => {
                    if(!user) {
                        return done(null, false, { message: "Incorrect username or password" });
                    }

                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if(err) throw err;
                        
                        if(isMatch) {
                            return done(null, user);
                        } else {
                            return done(null, false, { message: 'Incorrect username or password' });
                        }
                    });
                })
                .catch(err => console.log(err));
        })
    );

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
}