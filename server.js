var express = require("express");
var exphbs = require("express-handlebars");
var Sequelize = require("sequelize");
var bodyParser = require("body-parser");
var session = require('express-session');
var PORT = process.env.PORT || 3000;
var app =express();
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
    beforeCreate :function (argument) {

    }
  }
});

// database connection via sequelize
connection.sync().then(function() {
  app.listen(PORT, function() {
      console.log("Listening on:" + PORT)
  });
});
