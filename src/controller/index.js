const express = require("express");
const router = express.Router();

// Controllers

const appointment = require("./controllers/appointment");
const appointment_type = require("./controllers/appointment_type");
const appointment_note = require("./controllers/appointment_note");
const activity_log = require("./controllers/activity_log");
const employee = require("./controllers/employee");
const lunch_time = require("./controllers/lunch_time");

// Single point of getting all routes

router.use(
  employee,
  appointment,
  appointment_type,
  appointment_note,
  activity_log,
  lunch_time
);

module.exports = router;
