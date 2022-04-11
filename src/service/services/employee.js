const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { createGeneralToken } = require("../../auth/jwt");
const { sendEmail } = require("../../utils/email");
const config = require("../../config");
const { Employee } = require("../../model");

module.exports = {
  sendConfirmationEmail,
  confirmUserEmail,
  requestPasswordReset,
  resetPassword,
  create,
  delete: _delete,
  update,
  getOneById,
  getAll,
};

async function getAll({ page_number, page_size }) {
  let employees = [];

  page_size = parseInt(page_size, 10);
  page_number = parseInt(page_number, 10);

  if (page_size > 10) {
    page_size = 10;
  }

  const page = Math.max(0, page_number);
  const skip = page_number * page_size;

  try {
    employees = await Employee.aggregate([
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
    return { employees };
  } catch (err) {
    throw err;
  }
}

async function update(employee_id, updates) {
  let employee = {};

  try {
    employee = await Employee.findOneAndUpdate({ _id: employee_id }, updates, {
      new: true,
    });
    return employee;
  } catch (err) {
    throw err;
  }
}

async function create(id, { first_name, last_name, mobile_number }) {
  try {
    await Employee.findOneAndUpdate(
      { _id: id },
      { first_name, last_name, mobile_number }
    );
  } catch (err) {
    throw new Error(err);
  }

  return;
}

async function _delete(employee) {
  try {
    await Employee.findOneAndDelete({ email: employee.email });
  } catch (err) {
    throw new Error(err);
  }

  return;
}

async function setConfirmationToken(email, expires) {
  let token, employee;

  // Create token and send to database

  token = await createGeneralToken(email, expires);

  try {
    employee = await Employee.findOneAndUpdate(
      { email },
      { confirm_account_token: token }
    );
  } catch (e) {
    throw new Error(e);
  }

  return token;
}

async function sendConfirmationEmail(email) {
  // Get tokens involved

  let token;

  if (await Employee.exists({ email, is_confirmed: 1 })) {
    throw { name: "Forbidden", message: "User already has a confirmed email" };
  }

  try {
    token = await setConfirmationToken(email, "1h");
  } catch (e) {
    throw new Error(e);
  }

  try {
    sendEmail(
      email,
      "Confirm Account",
      {
        link: `${config.server.URL}/api/confirm-email?email=${email}&token=${token}`,
      },
      "ConfirmEmail"
    );
  } catch (e) {}
}

async function updatePassword(email, password) {
  try {
    const hash = await bcrypt.hash(password, config.bcrypt.SALTORROUNDS);
    await Employee.updateOne(
      { email: email },
      { $set: { password: hash } },
      { new: true }
    );
  } catch (err) {
    throw new Error(err);
  }

  return;
}

async function resetPassword(email, token, password) {
  try {
    if (
      (await jwt.verify(token, config.jwt.GENERAL_KEY_PUBLIC_KEY)) &&
      (await Employee.exists({ email: email, reset_password_token: token }))
    ) {
      await updatePassword(email, password);
    } else {
      throw { name: "NotFound", message: "Issue Resetting Password" };
    }
  } catch (err) {
    throw new Error(err);
  }
  return;
}

async function requestPasswordReset(email) {
  const employee = await Employee.findOne({ email });

  if (!employee) throw { name: "NotFound", message: "User does not exist" };

  const token = await createGeneralToken(email, "1h");

  // Add reset_password_token

  await Employee.findOneAndUpdate(
    { email: employee.email },
    { reset_password_token: token }
  );

  const link = `${config.client.URL}/password_reset?token=${token}&id=${employee.email}`;
  sendEmail(
    employee.email,
    "Reset Password",
    { first_name: employee.first_name, link: link },
    "requestResetPassword"
  );
  return;
}

async function confirmUserEmail(email, token) {
  try {
    if (await Employee.exists({ email })) {
      // Check JWT if not expired

      if (await jwt.verify(token, config.jwt.GENERAL_KEY_PUBLIC_KEY)) {
        await Employee.findOneAndUpdate(
          { email },
          { is_confirmed: 1, confirm_account_token: null }
        );
      }
    } else {
      throw { name: "NotFound", message: "Issue Confirming User" };
    }
  } catch (err) {
    return false;
  }

  return true;
}

async function getOneById(id) {
  let employee;
  try {
    employee = await Employee.findOne({ _id: id });
    return { employee };
  } catch (err) {
    throw { name: "NotFound", message: "Issue Confirming User" };
  }
}
