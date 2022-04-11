const express = require("express");
const router = express.Router();
const TOP_URL = "appointment-type";
const { appointmentTypeService } = require("../../service");

router.post(`${TOP_URL}`, createAppointmentType);
router.get(`${TOP_URL}s`, getAllAppointmentType);
router.delete(`${TOP_URL}/:type`, deleteAppointmentType);

module.exports = router;

async function createAppointmentType(req, res, next) {
  let result;
  try {
    result = await appointmentTypeService.create(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function getAllAppointmentType(req, res, next) {
  let results;
  try {
    results = await appointmentTypeService.getAll();
    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
}

async function deleteAppointmentType(req, res, next) {
  let results;
  try {
    results = await appointmentTypeService.delete(req.params.type);
    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
}
