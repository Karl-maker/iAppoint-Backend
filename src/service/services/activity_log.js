const { ActivityLog } = require("../../model");

module.exports = {
  create,
  getAllByEmployeeId,
  getAllByDate,
  getAll,
};

async function create(name, more_info) {
  let result = {};
  try {
    result = await ActivityLog.create({ name, more_info });
  } catch (err) {
    throw err;
  }

  return { activity_log: result };
}

async function getAllByEmployeeId(employee_id, { page_size, page_number }) {
  page_size = parseInt(page_size, 10);
  page_number = parseInt(page_number, 10);
  const page = Math.max(0, page_number);

  if (page_size > 30) {
    page_size = 30;
  }

  let results = [];

  try {
    results = await ActivityLog.find({ more_info: { employee_id } })
      .limit(page_size)
      .skip(page_size * page);
  } catch (err) {
    throw err;
  }

  return { activity_logs: results };
}

async function getAllByDate(day, month, year, { page_size, page_number }) {
  let activity_logs = [];
  page_size = parseInt(page_size, 10);
  page_number = parseInt(page_number, 10);

  if (page_size > 10) {
    page_size = 10;
  }

  const page = Math.max(0, page_number);
  const skip = page_number * page_size;

  let activity_date = new Date(year, month - 1, day, 0, 0, 0, 0);
  try {
    activity_logs = await ActivityLog.aggregate([
      {
        $match: {
          createdAt: {
            $gte: activity_date,
            $lt: new Date(
              new Date(activity_date).getTime() + 60 * 60 * 24 * 1000
            ),
          },
        },
      },
      { $sort: { createdAt: 1 } },
      {
        $facet: {
          metadata: [
            { $count: "total" },
            { $addFields: { page: page_number } },
          ],
          data: [{ $skip: skip }, { $limit: page_size }],
        },
      },
    ]);
    return { activity_logs };
  } catch (err) {
    throw err;
  }
}

async function getAll({ page_size, page_number }) {
  page_size = parseInt(page_size, 10);
  page_number = parseInt(page_number, 10);
  const page = Math.max(0, page_number);

  if (page_size > 30) {
    page_size = 30;
  }

  let results = [];

  try {
    results = await ActivityLog.find({})
      .sort({ createdAt: 1 })
      .limit(page_size)
      .skip(page_size * page);
  } catch (err) {
    throw err;
  }

  return { activity_logs: results };
}
