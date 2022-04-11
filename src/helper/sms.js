// Download the helper library from https://www.twilio.com/docs/node/install
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const config = require("../config");
const accountSid = config.twilio.ACCOUNT_SID;
const authToken = config.twilio.AUTH_TOKEN;
const phoneNumber = config.twilio.PHONE_NUMBER;
const client = require("twilio")(accountSid, authToken);

function createSMSMessage(message, to) {
  client.messages
    .create({
      body: message,
      from: phoneNumber,
      to: to,
    })
    .then((message) => console.log(message.sid));
}

module.exports = createSMSMessage;
