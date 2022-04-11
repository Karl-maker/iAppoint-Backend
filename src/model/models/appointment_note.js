const mongoose = require("mongoose");

const AppointmentNoteSchema = new mongoose.Schema(
  {
    appointment_id: { type: String, required: true },
    content: { type: String, required: [true, "Content is required"] },
    employee_id: { type: String, required: [true, "Employee is required"] },
  },
  {
    timestamps: true,
  }
);

const AppointmentNote = mongoose.model(
  "Appointment_Notes",
  AppointmentNoteSchema
);

module.exports = AppointmentNote;
