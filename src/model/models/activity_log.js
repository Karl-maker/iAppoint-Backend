const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    more_info: { type: Object },
  },
  {
    timestamps: true,
  }
);

const ActivityLog = mongoose.model("Activity_Logs", ActivityLogSchema);

module.exports = ActivityLog;
