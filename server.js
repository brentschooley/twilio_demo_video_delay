const express = require('express');
const schedule = require('node-schedule');
const moment = require('moment');
const bodyParser = require('body-parser');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

// Twilio Credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// require the Twilio module and create a REST client
const client = require('twilio')(accountSid, authToken);

const app = express();
app.set('port', (process.env.PORT || 5000));
app.use(bodyParser());

app.post('/sms', (req, res) => {
  console.log('Hi!');
  var date = moment().add(process.env.VIDEO_DELAY_SECONDS, 's').toDate();
  const from = req.body.From;
  console.log(date);
  console.log(from);
  var j = schedule.scheduleJob(date, function(y){
    client.calls.create({
      url: process.env.VOICE_TWIML_URL,
      to: from,
      from: process.env.TWILIO_PHONE_NUMBER,
    })
  }.bind(null, from));

  const twiml = new MessagingResponse();

  twiml.message(
    `Thanks for messaging my demo!
    Find out more about Twilio in the docs at https://twilio.com/docs
    Check us out on YouTube at https://youtube.com/TeamTwilio`
  );

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
});
