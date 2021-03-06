const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator/check");
const config = require("config");
const User = require("../../models/User");

// @route POST api/users
// @desc Register User
// @access Public

router.post(
  "/",
  [
    // Validate
    check("name", "Name is required")
      .not()
      .isEmpty(),
    check("email", "Please include a vaild email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;

    try {
      // USER REGISTRATION

      // 1 See if user exists
      let user = await User.findOne({ email: email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
      }
      // 2 Get users gravatar
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm" //default icon user
      });

      user = new User({
        name,
        email,
        avatar,
        password
      });
      // 3 Encrypt password

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      //Return jsonwebtoken
      const payload = {
        user: {
          id: user.id
        }
      };
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 }, //optional
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );

      // MSG if user registered or error if not
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server Error");
    }
  }
);
module.exports = router;
