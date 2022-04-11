const nodemailer = require("nodemailer");
const config = require("../config");

const transporter = nodemailer.createTransport({
  service: config.email.SERVICE || "Gmail",
  auth: {
    user: config.email.ADDRESS,
    pass: config.email.PASSWORD,
  },
});

module.exports = transporter;
