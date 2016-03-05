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
Event.sync();

// ------------^^^^setting for testing only^^^^----------------

var nodemailer = require('nodemailer');
var sender = require("./keys/secret.js");
var schedule = require('node-schedule');

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport('smtps://' + sender.email + '%40' + sender.host + ':' + sender.pass + '@smtp.' + sender.host);

// scheduler
// var j = schedule.scheduleJob('42 * * * * *', function(){
//   console.log('The answer to life, the universe, and everything!');
// });

function runEventChecks () {
  var event;
  var recipients = [];

  Event.findAll({

  }).then(function(results) {
    console.log(results);
    console.log(results.dataValues);
  })
}

runEventChecks();


function sendEmail (receivers, eventInfo) {

  // setup e-mail data with unicode symbols
  var mailOptions = {
    from: '"RU Flyer 👥" <climbershub@gmail.com>', // sender address
    to: receivers, // list of receivers
    subject: 'Upcoming Event!', // Subject line
    generateTextFromHTML: true, // Auto gen text field from html yay
    html: '<b>' + eventInfo + '</b>' // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });
}
