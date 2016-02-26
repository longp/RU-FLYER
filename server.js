var express = require("express");
var exphbs = require("express-handlebars");
var Sequelize = require("sequelize");
var bodyParser = require("body-parser");
var session = require('express-session');
var bcrypt = require("bcryptjs");
var passport = require('passport');
var passportLocal = require('passport-local');
const PORT = process.env.PORT || 3000;
var app = express();

// body parser setup
app.use(bodyParser.urlencoded({
    extended: false
}));

//handlebars setup
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set("view engine", 'handlebars');

// simplify routing
app.use("/js", express.static("public/js"));
app.use("/css", express.static("public/css"));

// routes
app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.post('/register', function (req, res) {
  console.log(req.body);
  user.create({
    username: req.body.username,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email
  });
});

//database setup
var Sequelize = require('sequelize');
var connection = new Sequelize('users', 'root', '', {
  dialect: 'mysql',
  port: 3306,
  host: 'localhost'
});

var user = connection.define('users', {
  username: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  email: Sequelize.STRING
}, {
  hooks: {
    beforeCreate: function(input){
      input.password = bcrypt.hashSync(input.password, 10);
    }
  }
});

// database connection via sequelize
connection.sync().then(function() {
  app.listen(PORT, function() {
      console.log("Listening on:" + PORT)
  });
});
