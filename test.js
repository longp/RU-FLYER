var Sequelize = require("sequelize");

require('dotenv').config();

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

connection.sync()

// run tests below

test();

function test () {
  // Attending.belongsToMany(Event, { through: 'worker_tasks', foreignKey: 'eventId' }).then(function (results) {
  //   console.log(results);
  // });

  // models.Event.belongsTo(models.Attending, {
  //       foreignKey: "eventId", as: "Friend"
  //   });

  Event.hasMany(Attending, {foreignKey: 'eventId'});

  Attending.findAll({
    include: [{
      model: Event,
      as: 'events'
    }],
    where:
      {'user': "user123",
      'events.id': "1"}
  }).then(function (results) {
    console.log(results);
  });
}
