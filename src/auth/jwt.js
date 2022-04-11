const jwt = require("jsonwebtoken");
const config = require("../config");
const { Login, Employee } = require("../model");

// ACCESS TOKEN

function getAccessTokenFromHeader(req) {
  let access_token =
    req.headers["x-access-token"] || req.headers["authorization"];

  // Remove Bearer from string
  access_token = access_token.replace(/^Bearer\s+/, "");

  return access_token;
}

async function createAccessToken(employee) {
  const body = {
    _id: employee._id,
    email: employee.email,
    first_name: employee.first_name,
    last_name: employee.last_name,
  };
  const access_token = await jwt.sign(
    { employee: body },
    config.jwt.ACCESS_TOKEN_PRIVATE_KEY,
    {
      expiresIn: config.jwt.ACCESS_TOKEN_LIFE,
      algorithm: config.jwt.ALGORITHM,
    }
  );

  return access_token;
}

// REFRESH TOKEN

async function createRefreshToken(employee) {
  const body = {
    _id: employee._id,
    email: employee.email,
  };
  const refresh_token = await jwt.sign(
    { employee: body },
    config.jwt.REFRESH_TOKEN_PRIVATE_KEY,
    {
      expiresIn: config.jwt.REFRESH_TOKEN_LIFE,
      algorithm: config.jwt.ALGORITHM,
    }
  );

  return refresh_token;
}

async function getAccessTokenWithRefreshToken(refresh_token) {
  const REFRESH_TOKEN_PUBLIC_KEY = config.jwt.REFRESH_TOKEN_PUBLIC_KEY;
  let employee, login;
  const payload = await jwt.verify(refresh_token, REFRESH_TOKEN_PUBLIC_KEY, {
    algorithm: [config.jwt.ALGORITHM],
  });

  if (!payload) {
    throw { name: "Unauthorized", message: "Expired" };
  }

  try {
    login = await Login.findOne({
      employee_id: payload.employee._id,
      token: refresh_token,
    });

    employee = await Employee.findOne({ _id: login.employee_id });
  } catch (err) {
    throw err;
  }

  if (!employee) {
    throw { name: "Unauthorized", message: "No User Found" };
  }

  return await createAccessToken(employee);
}

async function deleteRefreshToken(refresh_token) {
  const REFRESH_TOKEN_PUBLIC_KEY = config.jwt.REFRESH_TOKEN_PUBLIC_KEY;

  const payload = await jwt.verify(refresh_token, REFRESH_TOKEN_PUBLIC_KEY, {
    algorithm: [config.jwt.ALGORITHM],
  });

  if (!payload) {
    throw { name: "UnauthorizedError" };
  }

  try {
    await Login.findOneAndDelete({
      employee_id: payload.employee._id,
      token: refresh_token,
    });
  } catch (err) {
    throw { name: "UnexpectedError" };
  }

  return;
}

// GENERAL TOKEN

async function createGeneralToken(email, expires_in) {
  // verify this

  const token = await jwt.sign(
    { employee: email },
    config.jwt.GENERAL_KEY_PRIVATE_KEY,
    {
      expiresIn: expires_in || "1h",
      algorithm: config.jwt.ALGORITHM,
    }
  );

  return token;
}

module.exports = {
  getAccessTokenFromHeader,
  createAccessToken,
  createGeneralToken,
  deleteRefreshToken,
  createRefreshToken,
  getAccessTokenWithRefreshToken,
};
