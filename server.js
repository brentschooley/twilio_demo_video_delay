const express = require("express");
const schedule = require("node-schedule");
const moment = require("moment");
const bodyParser = require("body-parser");
const MessagingResponse = require("twilio").twiml.MessagingResponse;
const VoiceResponse = require("twilio").twiml.VoiceResponse;

// Twilio Credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// require the Twilio module and create a REST client
const client = require("twilio")(accountSid, authToken);

const app = express();
app.set("port", process.env.PORT || 5000);
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static("public"));

app.get('/', function (req, res) {
  res.send('Demo app ready for action!');
});

app.post("/sms", (req, res) => {
  console.log("Hi!");
  var date = moment().add(process.env.VIDEO_DELAY_SECONDS, "s").toDate();
  const from = req.body.From;

  schedule.scheduleJob(
    date,
    function () {
      client.calls.create({
        url: `${req.protocol}://${req.hostname}/voice_response`,
        to: from,
        from: process.env.TWILIO_PHONE_NUMBER,
      });
    }.bind(null, from)
  );

  const twiml = new MessagingResponse();

  twiml.message(
`
Thanks for messaging my demo!
Find out more about Twilio in the docs at https://twilio.com/docs
Check us out on YouTube at https://youtube.com/TwilioDevs
`
  );

  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml.toString());
});

app.post("/voice_response", (req, res) => {
  const twiml = new VoiceResponse();
  //twiml.play({}, `${req.protocol}://${req.hostname}/that_one_song.mp3`);
  twiml.play({}, `https://demo.twilio.com/docs/classic.mp3`);
  res.type("text/xml");
  res.send(twiml.toString());
});

app.listen(app.get("port"), () => {
  console.log("Node app is running on port", app.get("port"));
});
