const express = require("express");
const passport = require("passport");
const router = express.Router();
const TOP_URL = "/appointment-note";
const { appointmentNoteService } = require("../../service");

router.post(
  `${TOP_URL}`,
  passport.authenticate("jwt", { session: false }),
  createAppointmentNote
);
router.get(`${TOP_URL}s/:appointment_id`, getAllAppointmentNoteByAppointmentId);
router.delete(
  `${TOP_URL}/:appointment_note_id`,
  passport.authenticate("jwt", { session: false }),
  deleteAppointmentNoteById
);

module.exports = router;

async function createAppointmentNote(req, res, next) {
  let appointment_note = {};
  try {
    appointment_note = await appointmentNoteService.create(
      req.employee._id,
      req.body
    );
    res.status(200).json(appointment_note);
  } catch (err) {
    next(err);
  }
}

async function getAllAppointmentNoteByAppointmentId(req, res, next) {
  let appointment_notes = [];

  try {
    appointment_notes = await appointmentNoteService.getManyByAppointmentId(
      req.params.appointment_id,
      {
        page_number: req.query.page_number || 0,
        page_size: req.query.page_size || 10,
      }
    );

    res.status(200).json(appointment_notes);
  } catch (err) {
    next(err);
  }
}

async function deleteAppointmentNoteById(req, res, next) {
  let result = {};
  try {
    result = await appointmentNoteService.delete(
      req.params.appointment_note_id
    );

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
