const mongoose = require("mongoose");

const LoginSchema = new mongoose.Schema(
  {
    employee_id: { type: String },
    token: { type: String },
  },
  {
    timestamps: true,
  }
);

const Login = mongoose.model("Logins", LoginSchema);

module.exports = Login;
