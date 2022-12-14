const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceId = process.env.SSID;

const client = require("twilio")(accountSid, authToken);

client.verify.v2.services
  .create({ friendlyName: "My First Verify Service" })
  .then((service) => console.log(service.sid));

function sendSMS(number, next) {
  try {
    const client = require("twilio")(accountSid, authToken);

    return new Promise((resolve, reject) => {
      client.verify.v2
        .services(serviceId)
        .verifications.create({ to: `+91${number}`, channel: "sms" })
        .then((verifications) => {
          //console.log(verifications);
          resolve(verifications);
        });
    });
  } catch (err) {
    next(err);
  }
}

function verifySMS(number, otp, next) {
  try {
    // console.log(number, otp);
    const client = require("twilio")(accountSid, authToken);

    return new Promise((resolve, reject) => {
      client.verify.v2
        .services(serviceId)
        .verificationChecks.create({ to: `+91${number}`, code: otp })
        .then((verification_check) => {
          //console.log(verification_check.status);
          resolve(verification_check);
        });
    }).catch(console.error(Error));
  } catch (err) {
    next(err);
  }
}

module.exports = { verifySMS, sendSMS };
