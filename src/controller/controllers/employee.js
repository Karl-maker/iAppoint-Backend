const express = require("express");
const router = express.Router();
const passport = require("passport");
const rateLimit = require("express-rate-limit");
const parseCookies = require("../../utils/cookies");
const {
  createAccessToken,
  createRefreshToken,
  deleteRefreshToken,
  getAccessTokenWithRefreshToken,
} = require("../../auth/jwt");
const config = require("../../config");
const { employeeService } = require("../../service");
const { Login } = require("../../model");
const TOP_URL = "/employee";

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 60, // Limit each IP to 5 requests in API
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

router.post(
  `${TOP_URL}/authenticate`,
  rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 500,
  }),
  getAccessToken
);
router.post(
  `${TOP_URL}/register`,
  passport.authenticate("signup", { session: false }),
  registerUser
);

router.get(`${TOP_URL}/confirm-email`, limiter, confirmUser);
router.post(`${TOP_URL}/login`, limiter, loginUser);
router.post(
  `${TOP_URL}/request-reset-password/:email`,
  rateLimit({
    windowMs: 60 * 60 * 1000, // 60 minutes
    max: 3, // Limit each IP to 3 requests in API
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  }),
  requestResetUserPassword
);
router.delete(
  `${TOP_URL}/authenticate`,
  rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5,
  }),
  logoutUser
);
router.post(
  `/send-confirmation-email/:email`,
  rateLimit({
    windowMs: 60 * 60 * 1000, // 60 minutes
    max: 3, // Limit each IP to 3 requests in API
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  }),
  sendConfirmationEmail
);
router.post("/reset-password/:email", resetUserPassword);
router.put(
  "/password",
  rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 1, // Limit each IP to 1 requests in API
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  }),
  passport.authenticate("jwt", { session: false }),
  updateUserPassword
);
router.get(
  `${TOP_URL}`,
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => res.status(200).json(req.user)
);
router.delete(
  `${TOP_URL}`,
  passport.authenticate("jwt", { session: false }),
  deleteUser
);
router.get(`${TOP_URL}/:employee_id`, getEmployeeById);
router.get(`${TOP_URL}s`, getAllEmployees);

module.exports = router;

// Functions that will link to services

function getAllEmployees(req, res, next) {
  const { page_number, page_size } = req.query;

  employeeService
    .getAll({
      page_number: page_number || 0,
      page_size: page_size || 20,
    })
    .then(({ employees }) => {
      res.status(200).json({ employees });
    })
    .catch((err) => next(err));
}

function getEmployeeById(req, res, next) {
  employeeService
    .getOneById(req.params.employee_id)
    .then(({ employee }) => {
      res.status(200).json({ employee });
    })
    .catch((err) => next(err));
}

function getAccessToken(req, res, next) {
  const refresh_token = parseCookies(req).refresh_token;

  getAccessTokenWithRefreshToken(refresh_token)
    .then((access_token) => {
      res.status(200).json({
        access_token,
      });
    })
    .catch((err) => {
      next(err);
    });
}

function logoutUser(req, res, next) {
  deleteRefreshToken(parseCookies(req).refresh_token)
    .then(() => {
      res.status(200).json({
        message: "User logged out",
      });
    })
    .catch((err) => {
      next(err);
    });
}

function deleteUser(req, res, next) {
  employeeService
    .delete(req.user)
    .then(() => res.status(200).json({ message: "Delete" }))
    .catch((err) => next(err));
}

function updateUserPassword(req, res, next) {
  employeeService
    .updatePassword(req.user.email, req.body.password)
    .then(() => res.status(200).json({ message: "Password Updated" }))
    .catch((err) => next(err));
}

function sendConfirmationEmail(req, res, next) {
  const { email } = req.params;
  employeeService
    .sendConfirmationEmail(email)
    .then(() => {
      res.status(200).json({ message: "Check Email" });
    })
    .catch((err) => {
      next(err);
    });
}

function confirmUser(req, res, next) {
  const { email, token } = req.query;
  employeeService
    .confirmUserEmail(email, token)
    .then((result) => {
      if (result) res.redirect(`${config.client.URL}/login`);
      else res.redirect(`${config.client.URL}/expired_confirmation`);
    })
    .catch((err) => {
      next(err);
    });
}

async function registerUser(req, res, next) {
  let result;

  try {
    result = await employeeService.update(req.user._id, {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
    });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function loginUser(req, res, next) {
  passport.authenticate("login", async (err, employee, info) => {
    try {
      if (!employee) {
        const error = {
          name: "NotFound",
          message: "User Not Found",
        };

        return next(error);
      }

      req.login(employee, { session: false }, async (error) => {
        if (error) return next(error);

        const access_token = await createAccessToken(employee);
        const refresh_token = await createRefreshToken(employee);

        if ((await Login.find({ employee_id: employee._id }).count()) > 4) {
          await Login.findOneAndDelete().sort({ createdAt: 1 });
        }

        await Login.create({
          employee_id: employee._id,
          token: refresh_token,
        });

        return res
          .cookie("refresh_token", refresh_token, {
            secure: config.jwt.IS_HTTPS,
            httpOnly: false,
            path: "/api/employee/authenticate",
          })
          .status(200)
          .json({ access_token, employee });
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
}

function requestResetUserPassword(req, res, next) {
  const email = req.params.email;
  employeeService
    .requestPasswordReset(email)
    .then(() => {
      res.status(200).json({ message: "Check Email" });
    })
    .catch((err) => {
      next(err);
    });
}

function resetUserPassword(req, res, next) {
  const email = req.params.email;
  employeeService
    .resetPassword(email, req.body.token, req.body.password)
    .then(() => {
      res.status(200).json({ message: "Password Changed" });
    })
    .catch((err) => {
      next(err);
    });
}
