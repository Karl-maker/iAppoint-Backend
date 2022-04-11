const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const config = require("../../config");

const saltOrRounds = config.bcrypt.SALTORROUNDS;

//const

const MIN_PASSWORD = 5;

//--------------------------------------------------------------------------------

const EmployeeSchema = new mongoose.Schema(
  {
    first_name: { type: String },
    last_name: { type: String },
    mobile_number: { type: String },
    department: { type: String },
    profile_image: { type: String },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please use a valid email address",
      ],
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [
        MIN_PASSWORD,
        `Password must be longer than ${MIN_PASSWORD} characters`,
      ],
      select: 0,
    },
    is_confirmed: { type: Boolean, default: false },
    confirm_account_token: { type: String },
    reset_password_token: { type: String },
  },
  {
    timestamps: true,
  }
);

EmployeeSchema.pre("save", async function (next) {
  let encrypted_password = await bcrypt.hash(this.password, saltOrRounds);
  this.password = encrypted_password;
  next();
});

EmployeeSchema.methods.isValidPassword = async function (password) {
  let isValid = await bcrypt.compare(password, this.password);

  return isValid;
};

const Employee = mongoose.model("Employees", EmployeeSchema);

module.exports = Employee;
