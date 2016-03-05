
//require JAWSDB_URL in env file
var Sequelize = require("sequelize");
require('dotenv').config();
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
  date: {
    type: Sequelize.STRING,
    allowNull: false,
    validate : {
      notEmpty: true
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
    type: Sequelize.INTEGER,
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

module.exports = User;
module.exports = Event;
module.exports = Attending;