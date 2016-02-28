var express = require("express");
var exphbs = require("express-handlebars");
var Sequelize = require("sequelize");
var bodyParser = require("body-parser");
var session = require('express-session');
var bcrypt = require("bcryptjs");
var passport = require('passport');
var passportLocal = require('passport-local');
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

//routes for handlebars render
app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.post('/register', function (req, res) {
  // console.log(req.body);
  User.create(req.body).then(function(result){
    // res.redirect('/?msg=Account created');
  }).catch(function(err) {
    console.log(err);
    // res.redirect('/?msg=' + err.errors[0].message);
  });
  // User.create({
  //   username: req.body.username,
  //   password: req.body.password,
  //   firstName: req.body.firstName,
  //   lastName: req.body.lastName,
  //   email: req.body.email
  // });
  res.send("user created!!!!");
});

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/user');
  }
);

// passport auth strategy
passport.use(new passportLocal.Strategy(
  function(username, password, done) {
    User.findOne({
      where: {
        username: username
      }
    }).then(function (user) {
      if (user) {
        bcrypt.compareSync(password, user.dataValues.password, function (err, user) {
          if (user) {
            done(null, { id: username, username: username });
          } else {
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

// hashin (not working with this atm)
// function hashPass (password) {
//   bcrypt.genSalt(10, function(err, salt) {
//       bcrypt.hash(password, salt, function(err, hash) {
//           return hash;
//       });
//   });
// }

//database setup
var connection = new Sequelize('users', 'root', '', {
  dialect: 'mysql',
  port: 3306,
  host: 'localhost'
});

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
      console.log("password being hashed now");
      // input.password = hashPass(input.password);
      console.log("inputed password is " + input.password);
      input.password = bcrypt.hashSync(input.password, 10);
      console.log("hashed password is " + input.password);
    }
  }
});

User.sync();

// database connection via sequelize
connection.sync().then(function() {
  app.listen(PORT, function() {
      console.log("Listening on:" + PORT)
  });
});
