const { JWT_SECRET } = require("../secrets");
const jwt = require("jsonwebtoken");
const Users = require("../users/users-model");

const restricted = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
      jwt.verify(token, secrets.jwtSecret, (err, decodedToken) => {
        console.log(decodedToken);
        if (err) {
          res.status(401).json({ message: "Token invalid" });
        } else {
          req.decodedToken = decodedToken;
          console.log(req.decodedToken.rolename, "restricted");
          next();
        }
      });
    } else {
      res.status(401).json({ message: "Token required" });
    }
  } catch (err) {
    next(err);
  }
};

const only = (role_name) => (req, res, next) => {
  const realRole = req.decodedToken?.rolename;

  console.log(req.decodedToken, "only");
  if (realRole === role_name) {
    next();
  } else {
    res.status(403).json({ message: "This is not for you" });
  }
};

const checkUsernameExists = (req, res, next) => {
  const username = req.body.username;

  try {
    const user = Users.findBy({ username });
    if (user.length === 0) {
      res.status(401).json({ message: "Invalid credentials" });
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
};

const validateRoleName = (req, res, next) => {
  let { role_name } = req.body;
  const isValid = (role_name) => {
    return Boolean(role_name && typeof role_name === "string");
  };
  if (!req.body.role_name || req.body.role_name === " ") {
    req.body.role_name = "student";
    next();
  } else if (isValid(role_name)) {
    if (req.body.role_name.trim() === "admin") {
      res.status(422).json({ message: "Role can not be admin" });
    } else if (req.body.role_name.trim().length > 32) {
      res.status(422).json({
        message: "Role name can not be longer than 32 chars",
      });
    } else {
      next();
    }
  }
};

module.exports = {
  restricted,
  checkUsernameExists,
  validateRoleName,
  only,
};
