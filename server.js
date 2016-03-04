//require JAWSDB_URL in env file
require('dotenv').config();

var express = require("express");
var exphbs = require("express-handlebars");
var Sequelize = require("sequelize");
var bodyParser = require("body-parser");
var session = require('express-session');
var bcrypt = require("bcryptjs");
var passport = require('passport');
var passportLocal = require('passport-local').Strategy;
var PORT = process.env.PORT || 3000;
var app = express();


// middleware setup

app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({
  secret: 'keyboard cat rocks',
  resave: true,
  saveUninitialized: true,
  cookie : { secure : false, maxAge : (1 * 60 * 60 * 1000) } // 1 hours
}));
app.use(passport.initialize());
app.use(passport.session());


//handlebars setup

app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set("view engine", 'handlebars');


//static routes for js and css

app.use("/js", express.static("public/js"));
app.use("/css", express.static("public/css"));
app.use("/pics", express.static("public/pics"));


// passport auth strategy

passport.use(new passportLocal(
  function(username, password, done) {
    User.findOne({
        where: {
            username: username
        }
    }).then(function(user) {
        //check password against hash
        if(user){
            bcrypt.compare(password, user.dataValues.password, function(err, user) {
                if (user) {
                  //if password is correct authenticate the user with cookie
                  done(null, { id: username, username: username });
                } else{
                  done(null, null);
                }
            });
        } else {
            done(null, null);
        }
    });
  }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});
passport.deserializeUser(function(id, done) {
    done(null, { id: id, username: id })
});


//database setup

var connection = new Sequelize(process.env.JAWSDB_URL);

var User = connection.define('user', {
  username: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    validate : {
      notEmpty:true,
      isAlphanumeric: true
    }
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
    validate : {
      notEmpty: true,
      len: {
        args:[8, 20],
        msg: "Password must be 8-20 characters long"
      }
    }
  },
  firstName: {
    type: Sequelize.STRING,
    allowNull: false,
    validate : {
      notEmpty: true,
      is: ["^[a-z]+$", 'i']
    }
  },
  lastName: {
    type: Sequelize.STRING,
    allowNull: false,
    validate : {
      notEmpty: true,
      is: ["^[a-z]+$", 'i']
    }
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    validate : {
      isEmail: true
    }
  }
},
  {
  hooks: {
    beforeCreate: function(input){
      input.password = bcrypt.hashSync(input.password, 10);
    }
  }
});


// syncing tables
User.sync();


//routes

app.get("/", function (req, res) {
  if (req.user) {
    console.log(req.user);
    // Passport will create a req.user if the user is logged in
    res.redirect("/user");
  } else {
    res.render("home", {
      msg: req.query.msg
    });
  }
});

app.post('/register', function (req, res) {
  console.log(req.body);
  User.create({
    username: req.body.username,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email
  }).then(function () {
    res.send("User Created");
  }).catch(function(err) {
    res.redirect("/?msg=" + err.message);
  })
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/user',
  failureRedirect: '/?msg=Login Credentials do not work'
}));


// database connection via sequelize + port listening
connection.sync().then(function() {
  app.listen(PORT, function() {
      console.log("Listening on:" + PORT)
  });
});

