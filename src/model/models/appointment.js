const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required"] },
    description: { type: String, required: [true, "Description is required"] },
    employee_id: { type: String, required: [true, "Employee is required"] },
    type: { type: String },
    client: {
      type: Object,
      required: [true, "Client information is required"],
    },
    date_of_appointment: { type: Date, required: [true, "Date is required"] },
    status: { type: String, default: "pending" },
    confirmed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model("Appointments", AppointmentSchema);

module.exports = Appointment;
