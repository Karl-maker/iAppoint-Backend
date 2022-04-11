const {
  handleDuplicateKeyError,
  handleValidationError,
} = require("./error-formatting");

module.exports = errorHandler;

function errorHandler(err, req, res, next) {
  try {
    switch (true) {
      case err.name === "NotFound":
        //404 Errors
        return res.status(404).json({ message: err.message });
      case err.name === "Unauthorized":
        return res.status(401).json({ message: err.message });
      case err.name === "Forbidden":
        return res.status(403).json({ message: err.message });
      case err.name === "ValidationError":
        //400 Errors
        return handleValidationError(err, res);

      case err.code && err.code == 11000:
        return handleDuplicateKeyError(err, res);
      default:
        console.error({
          message: err.message,
          stacktrace: err.stacktrace,
          timestamp: new Date().toString(),
        });
        return res.status(500).json({ message: "Unexpected Error" });
    }
  } catch (e) {
    console.error({
      message: e,
      stacktrace: err.stacktrace,
      timestamp: new Date().toString(),
    });
    return res.status(500).json({ message: "Unexpected Error" });
  }
}
