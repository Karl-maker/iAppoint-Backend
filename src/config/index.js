require("dotenv-flow").config({
  silent: true,
});
const fs = require("fs");
const path = require("path");
const ENV = process.env;
let ACCESS_KEYS, REFRESH_KEYS, GENERAL_KEYS;

const readENVFile = (location) => {
  try {
    return fs.readFileSync(path.resolve(__dirname, location), "utf8");
  } catch (err) {
    // No File Detected
    console.log(err);
  }
};

try {
  ACCESS_KEYS = JSON.parse(ENV.ACCESS_KEYS);
  REFRESH_KEYS = JSON.parse(ENV.REFRESH_KEYS);
  GENERAL_KEYS = JSON.parse(ENV.GENERAL_KEYS);
} catch (err) {
  console.error("Keys unable to parse JSON, please check config variables");

  ACCESS_KEYS = { public: "", private: "" };
  REFRESH_KEYS = { public: "", private: "" };
  GENERAL_KEYS = { public: "", private: "" };
}

const variables = {
  environment: {
    NODE_ENV: ENV.NODE_ENV || "development",
  },

  server: {
    PORT: ENV.PORT || 8000,
    URL: ENV.URL || `http://localhost:${ENV.PORT || 8000}`,
  },

  db: {
    URI: ENV.DB_URI,
    USER: ENV.DB_USER,
    PASSWORD: ENV.DB_PASSWORD,
  },

  email: {
    SERVICE: ENV.EMAIL_SERVICE || "Gmail",
    ADDRESS: ENV.EMAIL_ADDRESS,
    PASSWORD: ENV.EMAIL_PASSWORD,
  },

  bcrypt: {
    SALTORROUNDS: 10,
  },

  twilio: {
    ACCOUNT_SID: ENV.TWILIO_ACCOUNT_SID || "",
    AUTH_TOKEN: ENV.TWILIO_AUTH_TOKEN || "",
    PHONE_NUMBER: ENV.TWILIO_PHONE_NUMBER || "",
  },

  google: {
    CREDENTIALS: ENV.GOOGLE_CREDENTIALS,
    CALENDAR_ID: ENV.CALENDAR_ID,
  },

  jwt: {
    ISSUER: ENV.JWT_ISSUER || "Appointment",
    ALGORITHM: ENV.JWT_ALGORITHM || "RS256",
    IS_HTTPS: ENV.JWT_IS_HTTPS || false,

    ACCESS_TOKEN_LIFE: ENV.ACCESS_TOKEN_LIFE || "30d",
    ACCESS_TOKEN_PUBLIC_KEY: ACCESS_KEYS.public,
    ACCESS_TOKEN_PRIVATE_KEY: ACCESS_KEYS.private,

    GENERAL_KEY_PUBLIC_KEY: GENERAL_KEYS.public,
    GENERAL_KEY_PRIVATE_KEY: GENERAL_KEYS.private,

    REFRESH_TOKEN_PUBLIC_KEY: REFRESH_KEYS.public,
    REFRESH_TOKEN_PRIVATE_KEY: REFRESH_KEYS.private,
    REFRESH_TOKEN_LIFE: ENV.REFRESH_TOKEN_LIFE || "30d",
  },

  reset_password: {
    TOKEN: { EXPIRATION: 3600 }, // In seconds
  },

  client: {
    URL: ENV.CLIENT_URL || "http://localhost:3000",
    PROTOCOL: ENV.CLIENT_PROTOCOL || "https",
  },
};

const config = { ...variables };

module.exports = config;
