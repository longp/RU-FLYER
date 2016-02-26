var express = require("express");
var exphbs = require("express-handlebars");
var Sequelize = require("sequelize");
var bodyParser = require("body-parser");
var session = require('express-session');
var PORT = process.env.PORT || 3000;

app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set("view engine", 'handlebars');


app.use("/js", express.static("public/js"));
app.use("/css", express.static("public/css"));s


app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});


//database setup
var Sequelize = require('sequelize');
var connection = new Sequelize('users', 'root', '', {
  dialect: 'mysql',
  port: 3306,
  host: 'localhost'
});

var user = connection.define('user', {
  username: Sequelize.STRING,
  password: Sequelize.STRING,
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  email: Sequelize.STRING
}), {
  hooks: {
    beforeCreate :function (argument) {

    }
  }
}

// database connection via sequelize
connection.sync().then(function() {
  app.listen(PORT, function() {
      console.log("Listening on:" + PORT)
  });
});
