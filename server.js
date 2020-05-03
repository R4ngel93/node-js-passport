if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
/* Set up */
const express = require('express');
const app = express();

const bcrypt = require('bcrypt');
const shortid = require('shortid');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');

const colors = require('colors');
const PORT = process.env.PORT || 3000;

const initializePassport = require('./passport-config.js');
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
);

/* Database */
const users = [];

/* Settings */
app.set('view-engine', 'ejs');

/* Middlewares */
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

/* Routes */
app.get('/', checkAuthenticated, (req, res) => {
  res.render('index.ejs', { name: req.user.name });
});

//Login
app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs');
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

//Register
app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs');
});

app.post('/register', checkNotAuthenticated, async (req, res) => {
  const { password, name, email } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({
      id: shortid.generate(),
      name: name,
      email: email,
      password: hashedPassword
    });
    res.redirect('/login');
  } catch{
    res.redirect('/register');
  }
  console.log(users);
});

app.delete('/logout', (req, res) => {
  req.logOut();
  res.redirect('/login');
});

/* Check authenticted */
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  return next();
}

/* Server */
app.listen(PORT, () => {
  console.log(`[Node.js] server on port: ${PORT} \u2713 `.bgGreen)
});