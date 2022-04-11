const express = require("express");
const router = express.Router();
const TOP_URL = "/lunch-time";
const passport = require("passport");
const { lunchTimeService } = require("../../service");

router.post(
  `${TOP_URL}`,
  passport.authenticate("jwt", { session: false }),
  createLunchTime
);

router.delete(
  `${TOP_URL}/:lunch_time_id`,
  passport.authenticate("jwt", { session: false }),
  deleteLunchTime
);

router.put(
  `${TOP_URL}/:lunch_time_id`,
  passport.authenticate("jwt", { session: false }),
  updateLunchTime
);

router.get(`${TOP_URL}/:employee_id`, getLunchTimeByEmployee_id);

module.exports = router;

async function createLunchTime(req, res, next) {
  let result = {};

  try {
    result = await lunchTimeService.create(req.user._id, req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function deleteLunchTime(req, res, next) {
  let result = {};

  try {
    result = await lunchTimeService.delete(req.params.lunch_time_id, req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function updateLunchTime(req, res, next) {
  let result = {};

  try {
    result = await lunchTimeService.update(req.params.lunch_time_id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function getLunchTimeByEmployee_id(req, res, next) {
  let result = {};

  try {
    result = await lunchTimeService.getByEmployeeId(req.params.employee_id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
