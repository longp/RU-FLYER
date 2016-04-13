//require JAWSDB_URL in env file
require('dotenv').config();
var Sequelize = require("sequelize");
var connection = new Sequelize(process.env.JAWSDB_URL);

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

User.sync();
Attending.sync();
Event.sync();

// ------------^^^^setting for testing only^^^^----------------

var nodemailer = require('nodemailer');
var sender = require("./keys/secret.js");
var schedule = require('node-schedule');

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport('smtps://' + sender.email + '%40' + sender.host + ':' + sender.pass + '@smtp.' + sender.host);

// scheduler
var job = schedule.scheduleJob('20 * * * *', function(){
  // Cron date will fire email blast at specified date and time
  runEventChecks();
});

function runEventChecks () {
  var recipients = [];
  var recipientsEmails = [];
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth();
  var day = date.getDate();
  var fullDate = year + "-" + padDate(month + 1) + "-" + padDate(day);
  //This^^^^^is really tomorrows date to test for a event coming up
  var event;

  Event.findAll({
  }).then(function(allEvents) {
    for (var i = allEvents.length - 1; i >= 0; i--) {
      if (allEvents[i].date === fullDate) {
        event = allEvents[i].dataValues;
        Attending.findAll({
          where: {eventId: allEvents[i].id}
        }).then(function (attendingUsers) {
          for (var j = attendingUsers.length - 1; j >= 0; j--) {
            recipients.push(attendingUsers[j].user);
          }
          User.findAll({
            where: {username: recipients}
          }).then(function (results) {
            for (var k = results.length - 1; k >= 0; k--) {
              recipientsEmails.push(results[k].email);
            }
            sendEmail(recipientsEmails, event);
            // console.log("Sending email to: " + recipientsEmails);
            // console.log("Event info is: " + event);
          })
        })
      }
    }
  })
}

function padDate (num) {
  if (num < 10) {
    return ("0" + num);
  }
}

function sendEmail (receivers, eventInfo) {

  // setup e-mail data with unicode symbols
  var mailOptions = {
    from: '"RU Flyer 👥" <climbershub@gmail.com>', // sender address
    to: receivers, // list of receivers
    subject: 'Upcoming Event!', // Subject line
    generateTextFromHTML: true, // Auto gen text field from html yay
    html: '<b><h1>' + eventInfo.event + '</h1><br>Where: ' + eventInfo.location + '<br>When: ' + eventInfo.time + ' ' + eventInfo.date + '<br>' + eventInfo.desc + '</b>' // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent to: ' + mailOptions.to);
  });

  recipients = [];
  recipientsEmails = [];
  event = null;
}
