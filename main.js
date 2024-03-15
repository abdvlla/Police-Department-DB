require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const methodOverride = require('method-override');
const initializePassport = require('./passport-setup');
const app = express();
const bodyParser = require('body-parser');


const PORT = process.env.PORT || 4000;

// Connecting to MongoDB 
mongoose.connect(process.env.DB_URI);
const db = mongoose.connection;
db.on("error", (error) => console.log(error, "Not able to connect!"));
db.once("open", () => console.log("Connected to MongoDB"));

// Middlewares
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(session({
    secret: 'SECRET',
    saveUninitialized: true,
    resave: false,
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// passport setup

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.use(flash())
app.set('views', __dirname + '/views')

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

app.use(express.static('uploads'));

// User schema
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
});

const User = mongoose.model('User', userSchema);

// Template Engine
app.set('view engine', 'ejs');

function calculateAge(date) {
    const now = new Date();
    const diff = Math.abs(now - date);
    const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
    return age;
}

app.locals.calculateAge = calculateAge



// Route prefix

app.use("", require("./routes/person"));
app.use("", require("./routes/officer"));
app.use("", require("./routes/case"));

app.listen(PORT, () => {
    console.log(`Server Connected! go to http://localhost:${PORT}`);
});


initializePassport(
    passport,
    async (email) => await User.findOne({ email }),
    async (id) => await User.findById(id),
    User
);

app.get('/', checkAuthenticated, (req, res) => {
    console.log('req.user:', req.user); 
    console.log('name:', req.user ? req.user.name : null);
    res.render('authentication/index.ejs', { title: "Home Page", req: req, name: req.user ? req.user.name : null });
});


app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('authentication/login.ejs', { title: "Login" });
})

app.post('/login', checkNotAuthenticated, (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        console.log('err:', err);
        console.log('user:', user);
        console.log('info:', info);

        if (err) {
            return next(err);
        }

        if (!user) {
            console.log('Authentication failed. Redirecting to /login');
            req.flash('error', 'Invalid credentials');
            return res.redirect('/login');
        }

        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }

            console.log('Authentication successful. Redirecting to /');
            return res.redirect('/');
        });
    })(req, res, next);
});


app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('authentication/register.ejs', { title: "Register" });
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        });
        await user.save();
        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.redirect('/register');
    }
});

app.delete('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/login');
    });
});

app.get('/index', checkAuthenticated, (req, res) => {
    res.render('authentication/index.ejs', { req, name: req.user ? req.user.name : null });
});


function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

module.exports = {
    checkNotAuthenticated,
    checkAuthenticated
};
