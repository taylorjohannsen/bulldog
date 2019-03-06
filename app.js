const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const db = require('./config/keys');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const path = require('path');
require('./config/passport')(passport);

const app = express();

// css and client side js
app.use('/public', express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, 'public')));
app.set('pictures', path.join(__dirname, 'public/pictures'));

// mongodb
mongoose.connect(db.MongoURI, { useNewUrlParser: true })
    .then(() => console.log('DB Connected!'))
    .catch(err => console.log(err));

// ejs
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// bodyparser
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 

// express session
app.use(session({
    secret: 'g773477a',
    resave: true,
    saveUninitialized: true,
}));

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// routes 
app.use('/', require('./routes/index'));
app.use('/admin', require('./routes/admin'));

app.listen(3000, console.log('Server started on port 3000'));