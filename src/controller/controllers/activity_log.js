const express = require("express");
const router = express.Router();
const TOP_URL = "/activity-log";
const { activityLogService } = require("../../service");

router.get(`${TOP_URL}s/:employee_id`, getActivityLogByEmployeeId);
router.get(`${TOP_URL}s`, getActivityLogs);

module.exports = router;

async function getActivityLogs(req, res, next) {
  let result = {};
  let { page_number, page_size, day, year, month } = req.query;
  try {
    result = await activityLogService.getAllByDate(day, month, year, {
      page_number: page_number || 0,
      page_size: page_size || 10,
    });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function getActivityLogByEmployeeId(req, res, next) {
  let result = {};
  let { page_number, page_size } = req.query;
  try {
    result = await activityLogService.getAllByEmployeeId(
      req.params.employee_id,
      { page_number: page_number || 0, page_size: page_size || 10 }
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
