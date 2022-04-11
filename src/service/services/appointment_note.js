const { AppointmentNote } = require("../../model");

module.exports = {
  create,
  delete: _delete,
  getManyByAppointmentId,
};

async function create(employee_id, { appointment_id, content }) {
  let appointment_note = {};
  try {
    appointment_note = await AppointmentNote.create({
      employee_id,
      appointment_id,
      content,
    });
  } catch (err) {
    throw err;
  }

  return { appointment_note };
}

async function _delete(id) {
  try {
    await AppointmentNote.findOneAndRemove({
      _id: id,
    });
  } catch (err) {
    throw err;
  }

  return { message: "Deleted Appointment Note" };
}

async function getManyByAppointmentId(
  appointment_id,
  { page_number, page_size }
) {
  let appointment_notes = {};
  page_size = parseInt(page_size, 10);
  page_number = parseInt(page_number, 10);

  if (page_size > 10) {
    page_size = 10;
  }

  const page = Math.max(0, page_number);
  const skip = page_number * page_size;

  try {
    appointment_notes = await AppointmentNote.aggregate([
      {
        $match: {
          appointment_id: appointment_id,
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

    return appointment_notes;
  } catch (err) {
    throw err;
  }
}
