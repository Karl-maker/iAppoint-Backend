const { AppointmentType } = require("../../model");

module.exports = { create, getAll, delete: _delete };

async function create({ description, type }) {
  let appointment_type = {};

  try {
    appointment_type = await AppointmentType.create({ description, type });
    return { appointment_type };
  } catch (err) {
    throw err;
  }
}

async function getAll() {
  let appointment_types = [];

  try {
    appointment_types = await AppointmentType.find({});
    return { appointment_types };
  } catch (err) {
    throw err;
  }
}

async function _delete(type) {
  try {
    await AppointmentType.findOneAndDelete({ type });
    return { message: "Deleted Appointment Type" };
  } catch (err) {
    throw err;
  }
}
