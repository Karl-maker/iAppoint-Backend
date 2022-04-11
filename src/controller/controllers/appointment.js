const express = require("express");
const router = express.Router();
const URL_TOP = "/appointment";
const passport = require("passport");
const { appointmentService, activityLogService } = require("../../service");
const { googleCalendarService } = require("../../service");

router.post(`${URL_TOP}`, createAppointment);
router.get(`${URL_TOP}/:id`, getAppointmentById);
router.get(`${URL_TOP}s`, getAppointments);
router.delete(`${URL_TOP}/:id`, deleteAppointmentById);
router.put(
  `${URL_TOP}/:id`,
  passport.authenticate("jwt", { session: false }),
  updateAppointmentById
);

module.exports = router;

// Methods for controller

async function createAppointment(req, res, next) {
  let result = {};

  try {
    result = await appointmentService.create(req.body);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function getAppointmentById(req, res, next) {
  let result = {};

  try {
    result = await appointmentService.getById(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function getAppointments(req, res, next) {
  let result = {};
  let { employee_id, month, day, year, page_number, page_size } = req.query;

  try {
    result = await appointmentService.getMany({
      month,
      day,
      year,
      page_number: page_number || 0,
      page_size: page_size || 10,
      employee_id: employee_id || false,
    });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function deleteAppointmentById(req, res, next) {
  let result = {};

  try {
    result = await appointmentService.delete(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function updateAppointmentById(req, res, next) {
  let result = {};

  try {
    result = await appointmentService.update(req.params.id, req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
