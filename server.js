
var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var session = require('express-session');
var bcrypt = require("bcryptjs");
var methodOverride = require("method-override");
var passport = require('passport');
var passportLocal = require('passport-local').Strategy;
var PORT = process.env.PORT || 3000;
var app = express();
var User = require('./models/models.js');
var Event = require('./models/models.js');
var Attending = require('./models/models.js');
var Sequelize = require("sequelize");
require('dotenv').config();
var connection = new Sequelize(process.env.JAWSDB_URL);


// middleware setup
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(methodOverride('_method'))
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
    Attending.findAll({
      where: {'user': req.user.username}
    }).then(function (results) {
      var allIds = [0];
      for (var i = results.length - 1; i >= 0; i--) {
        allIds.push(results[i].eventId);
      }
      console.log("all attendance ids for this user are: " + allIds);
      Event.findAll({
        limit: 30,
        where: {
          creator: {
            $notLike: req.user.username
          },
          id: {
            $notIn: allIds
          }
        }
      }).then(function (results) {
        res.render("user", {
          username: req.user.username,
          event: results
        });
      })
    });
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
        {'user': req.user.username}
    }).then(function (results) {
      var allIds = [];
      for (var i = results.length - 1; i >= 0; i--) {
        allIds.push(results[i].eventId);
      }
      Event.findAll({
        where:
        {id: allIds}
      }).then(function (eventsAtt) {
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

app.delete("/remove", function (req, res) {
  console.log(req.body);
  Event.destroy({
    where: {id: req.body.id}
  }).then(function () {
    res.redirect('/events');
  })
})

app.delete("/delete", function (req, res) {
  console.log(req.body);
  Attending.destroy({
    where: {
      eventId: req.body.id
    }
  }).then(function () {
    res.redirect("/events");
  });
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
      date: req.body.date,
      location: req.body.location,
      description: req.body.desc,
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
      eventId: req.params.eventId,
      user: req.user.username
    }).then(function () {
      res.redirect("/user/?msg=You are now attending!");
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
