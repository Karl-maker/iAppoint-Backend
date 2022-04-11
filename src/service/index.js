const appointmentService = require("./services/appointment");
const activityLogService = require("./services/activity_log");
const appointmentNoteService = require("./services/appointment_note");
const appointmentTypeService = require("./services/appointment_type");
const employeeService = require("./services/employee");
const lunchTimeService = require("./services/lunch_time");
const googleCalendarService = require("./services/google_calendar");

module.exports = {
  appointmentService,
  activityLogService,
  appointmentNoteService,
  appointmentTypeService,
  employeeService,
  lunchTimeService,
  googleCalendarService,
};
