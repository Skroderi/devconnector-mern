const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator/check");
const config = require("config");
const bcrypt = require("bcryptjs");
const User = require("../../models/User");

// @route GET api/auth
// @desc Test Route
// @access Public

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route POST api/users
// @desc Authenticate user & get token
// @access Public

router.post(
  "/",
  [
    // Validate
    check("email", "Please include a vaild email").isEmail(),
    check("password", "Please is required").exists()
  ],
  async (req, res) => {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    try {
      // USER REGISTRATION

      // 1 See if user exists
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

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
