require("dotenv-flow").config({
  silent: true,
});
const mongoose = require("mongoose");

//............. DB MODELS.............................

// Create the database connection

const DB_URI = process.env.DB_URI;
const DB_USER = process.env.DB_USER || null;
const DB_PASSWORD = process.env.DB_PASSWORD || null;

const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI, {
      user: DB_USER,
      pass: DB_PASSWORD,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (err) {
    console.error(err);
  }
};

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on("connected", () => {
  console.log("Mongoose default connection is open");
});

// If the connection throws an error
mongoose.connection.on("error", (err) => {
  console.error("Mongoose default connection error: " + err);
});

// When the connection is disconnected
mongoose.connection.on("disconnected", () => {
  console.log("Mongoose is disconnected");
});

// If the Node process ends, close the Mongoose connection
process.on("SIGINT", () => {
  mongoose.connection.close(() => {
    console.log("Mongoose disconnected by termination");
    process.exit(0);
  });
});

module.exports = connectDB;
