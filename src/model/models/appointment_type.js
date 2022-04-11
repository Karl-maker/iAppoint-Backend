const mongoose = require("mongoose");

const AppointmentTypeSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    description: { type: String, required: [true, "Description needed"] },
  },
  {
    timestamps: false,
  }
);

const AppointmentType = mongoose.model(
  "Appointment_Types",
  AppointmentTypeSchema
);

module.exports = AppointmentType;
