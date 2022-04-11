const mongoose = require("mongoose");

const LunchTimeSchema = new mongoose.Schema(
  {
    employee_id: { type: String, required: [true, "Employee is required"] },
    time: { type: Number, required: [true, "Date is required"], default: 12 },
  },
  {
    timestamps: true,
  }
);

const LunchTime = mongoose.model("LunchTimes", LunchTimeSchema);

module.exports = LunchTime;
