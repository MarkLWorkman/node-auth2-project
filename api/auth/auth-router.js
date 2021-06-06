const router = require("express").Router();
const Users = require("../users/users-model");
const { checkUsernameExists, validateRoleName } = require("./auth-middleware");
const { JWT_SECRET } = require("../secrets");
const bcrypt = require("bcrypt");
const jqt = require("jsonwebtoken");

router.post("/register", validateRoleName, async (req, res, next) => {
  const credentials = req.body;

  try {
    const hash = bcrypt.hashSync(credentials.password);
    credntials.password = hash;

    const user = await Users.add(credentials);
    const token = generateToken(user);
    res.status(201).json({ data: user, token });
  } catch (err) {
    next(err);
  }
});

router.post("/login", checkUsernameExists, async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const [user] = await Users.findBy({ username: username });

    if (user && bcrypt.compareSync(password, user.password)) {
      const token = generateToken(user);
      res.status(200).json({ message: `${username} is back!`, token: token });
    } else {
      res.status(404).json({ message: "invalid login credentials" });
    }
  } catch (err) {
    next(err);
  }
});

const generateToken = (user) => {
  const payload = {
    subject: user.user_id,
    username: user.username,
    rolename: user.role_name,
  };

  const options = {
    expiresIn: "1d",
  };

  const token = jwt.sign(payload, JWT_SECRET, options);

  return token;
};

module.exports = router;
