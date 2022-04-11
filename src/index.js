const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const cors = require("cors");

const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const app = express();
const config = require("./config");
const errorHandler = require("./utils/error");
const controllers = require("./controller");
const server = http.createServer(app);

// Connect to DB
require("./helper/db")();
require("./auth/passport");

app.use(
  cors({
    origin: ["http://localhost:3000", " http://192.168.0.2:3000"], // All Origins
    credentials: true,
  })
);
app.use(jsonParser);
app.use(urlencodedParser);
app.use("/api", controllers);
app.use("*", (req, res, next) => {
  res.status(404).send("Not Found");
});
app.use(errorHandler);

server.listen(config.server.PORT || 5000, () => {
  console.log(`Server is listening on port ${server.address().port}`);
});
