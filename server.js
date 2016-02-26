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
