const { LunchTime } = require("../../model");

module.exports = {
  create,
  delete: _delete,
  update,
  getByEmployeeId,
};

async function create(employee_id, { time }) {
  // default time

  let lunch_time = {};

  if (await LunchTime.exists({ employee_id })) {
    lunch_time = await LunchTime.findOneAndUpdate(
      { employee_id },
      { time },
      { new: 1 }
    );
    return lunch_time;
  }

  try {
    lunch_time = await LunchTime.create({ employee_id, time });
    return lunch_time;
  } catch (err) {
    throw err;
  }
}

async function getByEmployeeId(employee_id) {
  let lunch_time = {};

  try {
    lunch_time = await LunchTime.findOne({ employee_id });
    return lunch_time;
  } catch (err) {
    throw err;
  }
}

async function update(id, { time }) {
  let lunch_time = {};

  try {
    lunch_time = await LunchTime.findOneAndUpdate(
      { _id: id },
      { time },
      {
        new: true,
      }
    );
    return lunch_time;
  } catch (err) {
    throw err;
  }
}

async function _delete(id) {
  try {
    await LunchTime.findOneAndDelete({ _id: id });
    return { message: "Deleted Successfully" };
  } catch (err) {
    throw err;
  }
}
