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


var Event = connection.define('event', {
  event: {
    type: Sequelize.STRING,
    allowNull: false,
    validate : {
      notEmpty:true,
    }
  },
  time: {
    type: Sequelize.STRING,
    allowNull: false,
    validate : {
      notEmpty: true
    }
  },
  location: {
    type: Sequelize.STRING,
    allowNull: false,
    validate : {
      notEmpty: true,
    }
  },
  desc: {
    type: Sequelize.BLOB,
    allowNull: false,
    validate : {
      notEmpty: true,
    }
  },
  creator: {
    type: Sequelize.STRING,
    allowNull: false,
    validate : {
      notEmpty: true
    }
  }
});


var Attending = connection.define('attendance', {
  eventId: {
    type: Sequelize.STRING,
    allowNull: false,
    validate : {
      notEmpty:true,
    }
  },
  user: {
    type: Sequelize.STRING,
    allowNull: false,
    validate : {
      notEmpty: true
    }
  }
});

// syncing tables
User.sync();
Event.sync();
Attending.sync();


//routes

app.get("/", function (req, res) {
  if (req.user) {
    // Passport will create a req.user if the user is logged in
    res.redirect("/user");
  } else {
    res.render("home", {
      msg: req.query.msg
    });
  }
});

app.get("/user", function (req, res) {
  if (req.user) {
    Event.findAll({
      limit: 10
    }).then(function (results) {
      res.render("user", {
        username: req.user.username,
        event: results
      });
    })
  } else {
    res.render("home", {
      msg: "Please Log In"
    });
  }
})

app.get("/events", function (req, res) {
  if (req.user) {
    Event.findAll({
      where: {creator: req.user.username},
    }).then(function (eventsCreated) {
      Attending.findAll({
      where:
        {'user': "user123"}
    }).then(function (results) {
      var allIds = [];
      for (var i = results.length - 1; i >= 0; i--) {
        allIds.push(results[i].id);
      }
      Event.findAll({
        where:
        {id: allIds}
      }).then(function (eventsAtt) {
          // console.log(eventsCreated);
          // console.log(eventsAtt);
          res.render("events", {
            username: req.user.username,
            eventsCreated: eventsCreated,
            eventsAtt: eventsAtt
          });
        })
      });
    })
  } else {
    res.render("home", {
      msg: "Please Log In"
    });
  }
})

app.post('/register', function (req, res) {
  User.create({
    username: req.body.username,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email
  }).then(function () {
    res.redirect("/?msg=User Created Please Sign In");
  }).catch(function(err) {
    res.redirect("/?msg=" + err.message);
  })
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/user',
  failureRedirect: '/?msg=Login Credentials do not work'
}));

app.post("/newevent", function (req, res) {
  if (req.user) {
    Event.create({
      event: req.body.event,
      time: req.body.time,
      location: req.body.location,
      desc: req.body.desc,
      creator: req.user.username
    }).then(function () {
      res.redirect("/events/?msg=You created a new event");
    }).catch(function(err) {
      res.redirect("/?msg=" + err.message);
    })
  } else {
    res.render("home", {
      msg: "Please Log In"
    });
  }
})

app.post("/attend/event/:eId", function (req, res) {
  if (req.user) {
    Attending.create({
      eventId: req.params.eId,
      user: req.user.username
    }).then(function () {
      res.send("You are marked as attending!");
    }).catch(function(err) {
      res.redirect("/?msg=" + err.message);
    })
  } else {
    res.render("home", {
      msg: "Please Log In"
    });
  }
})


// database connection via sequelize + port listening
connection.sync().then(function() {
  app.listen(PORT, function() {
      console.log("Listening on:" + PORT)
  });
});
