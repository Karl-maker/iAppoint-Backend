const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const JWTstrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;
const config = require("../config");
const { Employee } = require("../model");
const { employeeService } = require("../service");
const bcrypt = require("bcrypt");
const bcryptSalt = config.bcrypt.SALTORROUNDS;

passport.use(
  "signup",
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const employee = await Employee.create({
          email: email.toLowerCase(),
          password,
        });

        await employeeService.sendConfirmationEmail(employee.email);

        return done(null, employee);
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.use(
  "login",
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const employee = await Employee.findOne({
          email: email.toLowerCase(),
        }).select({
          password: 1,
          email: 1,
          username: 1,
          account_type: 1,
          is_confirmed: 1,
          first_name: 1,
          last_name: 1,
        });

        if (!employee) {
          return done(null, false, {
            name: "NotFound",
            message: "No account created with that email",
          });
        }

        const validate = await employee.isValidPassword(password);

        if (!validate) {
          return done(null, false, {
            name: "Unauthorized",
            message: "Email or Password is not correct",
          });
        }

        return done(null, employee);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  new JWTstrategy(
    {
      secretOrKey: config.jwt.ACCESS_TOKEN_PUBLIC_KEY,
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      algorithm: [config.jwt.ALGORITHM],
    },
    async (token, done) => {
      try {
        return done(null, token.employee);
      } catch (error) {
        done(error);
      }
    }
  )
);
