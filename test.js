var nodemailer = require('nodemailer');
var sender = require("./keys/secret.js");

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport('smtps://' + sender.email + '%40' + sender.host + ':' + sender.pass + '@smtp.' + sender.host);


// setup e-mail data with unicode symbols
var mailOptions = {
    from: '"RU Flyer 👥" <climbershub@gmail.com>', // sender address
    to: 'alexg2195@gmail.com', // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world', // plaintext body
    html: '<b>Hello world</b>' // html body
};

// send mail with defined transport object
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
});
