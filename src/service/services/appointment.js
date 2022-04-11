const createSMSMessage = require("../../helper/sms");
const { Appointment, AppointmentNote } = require("../../model/index");
const { formatDate, datePresentation } = require("../../utils/date");
const { sendEmail } = require("../../utils/email");
const googleCalendarService = require("./google_calendar");
const TIMEZONE = "Etc/GMT-3";

module.exports = {
  create,
  getById,
  getMany,
  delete: _delete,
  update,
};

async function create({
  title,
  description,
  client,
  date_of_appointment,
  employee_id,
  type,
}) {
  let appointment = {};

  try {
    appointment = await Appointment.create({
      title,
      description,
      client,
      date_of_appointment,
      employee_id,
      type,
    });
  } catch (err) {
    throw err;
  }

  console.log(client);

  // Send Email

  try {
    await sendEmail(
      client.email,
      "Appointment Created",
      {
        header: `Hello, ${client.first_name}`,
        paragraph: `iAppoint appointment is set for ${formatDate(
          new Date(date_of_appointment)
        )}`,
      },
      "basicMessage"
    );
  } catch (err) {
    console.log(err);
  }

  // Send SMS

  try {
    await createSMSMessage(
      `Hi ${
        client.first_name || "customer"
      }, iAppoint appointment is set for ${formatDate(
        new Date(date_of_appointment)
      )}, which is titled "${appointment.title}"`,
      client.phone_number
    );
  } catch (err) {
    console.log(err);
  }

  // Google Calendar Variable

  let event = {
    summary: title,
    location: "iAppoint",
    description: description,
    start: {
      dateTime: date_of_appointment,
      timeZone: TIMEZONE,
    },
    end: {
      dateTime: date_of_appointment,
      timeZone: TIMEZONE,
    },
    recurrence: ["RRULE:FREQ=DAILY;COUNT=2"],
    //attendees: [{ email: client.email }],
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 24 * 60 },
        { method: "popup", minutes: 10 },
      ],
    },
  };

  if (await googleCalendarService.insertEvent(event)) {
    console.log("Google Created Event");
  }

  return {
    appointment,
  };
}

async function getById(id) {
  let appointment = {};

  try {
    appointment = await Appointment.aggregate([
      {
        $addFields: {
          id: { $toString: "$_id" },
        },
      },
      {
        $match: { id: id },
      },
      {
        $addFields: {
          id: { $toString: "$_id" },
        },
      },
      {
        $lookup: {
          from: "appointment_notes",
          localField: "id",
          foreignField: "appointment_id",
          as: "notes",
          pipeline: [{ $count: "amount" }],
        },
      },
    ]);
  } catch (err) {
    throw err;
  }

  return { appointment };
}

async function getMany({
  day,
  month,
  year,
  page_number,
  page_size,
  employee_id,
}) {
  let appointments = [];
  let getForEmployee = {
    $addFields: {
      groupsArray: { $objectToArray: "$groups" },
    },
  };
  page_size = parseInt(page_size, 10);
  page_number = parseInt(page_number, 10);

  if (page_size > 10) {
    page_size = 10;
  }

  if (employee_id) {
    getForEmployee = {
      $match: {
        employee_id: employee_id,
      },
    };
  }

  const page = Math.max(0, page_number);
  const skip = page_number * page_size;

  let appointment_date = new Date(year, month - 1, day, 0, 0, 0, 0);

  try {
    appointments = await Appointment.aggregate([
      getForEmployee,
      {
        $match: {
          date_of_appointment: {
            $gte: appointment_date,
            $lt: new Date(
              new Date(appointment_date).getTime() + 60 * 60 * 24 * 1000
            ),
          },
        },
      },
      { $sort: { date_of_appointment: 1 } },
      {
        $addFields: {
          id: { $toString: "$_id" },
        },
      },

      {
        $lookup: {
          from: "appointment_notes",
          localField: "id",
          foreignField: "appointment_id",
          as: "notes",
          pipeline: [{ $count: "amount" }],
        },
      },
      {
        $addFields: {
          employee_id: { $toObjectId: "$employee_id" },
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "employee_id",
          foreignField: "_id",
          as: "employee",
          pipeline: [
            {
              $project: {
                _id: 1,
                first_name: 1,
                last_name: 1,
                email: 1,
              },
            },
          ],
        },
      },
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
    return { appointments };
  } catch (err) {
    throw err;
  }
}

async function _delete(id) {
  try {
    await Appointment.findOneAndDelete({ _id: id });
    await AppointmentNote.deleteMany({ appointment_id: id });
  } catch (err) {
    throw err;
  }
  return { message: "Deleted Appointment" };
}

async function update(id, updates) {
  let appointment = {};

  try {
    appointment = await Appointment.findOneAndUpdate({ _id: id }, updates, {
      new: true,
    });
  } catch (err) {
    throw err;
  }

  let client = appointment.client;

  // Send SMS

  try {
    await createSMSMessage(
      `Hi ${
        client.first_name || "customer"
      }, iAppoint appointment has been updated. The status is now set to ${
        appointment.status
      }. This appointment is set for ${formatDate(
        new Date(appointment.date_of_appointment)
      )}, at ${
        datePresentation(new Date(appointment.date_of_appointment)).hour
      }${datePresentation(new Date(appointment.date_of_appointment)).amOrpm}`,
      client.phone_number
    );
  } catch (err) {
    console.log(err);
  }

  return { message: "Updated", appointment };
}
