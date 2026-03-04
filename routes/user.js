// const express = require("express");
// const router = express.Router();
// const passport = require("passport");

// const wrapAsync = require("../utils/wrapAsync");
// const { savedRedirectUrl } = require("../middleware");

// const userController = require("../controllers/users");

// router.route("/signup")
//   .get(userController.renderSignupForm)
//   .post(wrapAsync(userController.signup));


// router.route("/login") 
//     .get( userController.renderLoginForm)
//     .post(
//         "/login",
//         savedRedirectUrl,
//         passport.authenticate("local", {
//           failureRedirect: "/login",
//           failureFlash: true,
//         }),
//         userController.login
// ); 
// // ================= LOGOUT =================
// router.get("/logout", userController.logout);

// module.exports = router;

const express = require("express");
const router = express.Router();
const passport = require("passport");

const wrapAsync = require("../utils/wrapAsync");
const { savedRedirectUrl } = require("../middleware");

const userController = require("../controllers/users");


// ================= SIGNUP =================
router.route("/signup")
  .get(userController.renderSignupForm)
  .post(wrapAsync(userController.signup));


// ================= LOGIN =================
router.route("/login")
  .get(userController.renderLoginForm)
  .post(
    savedRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login
  );


// ================= LOGOUT =================
router.get("/logout", userController.logout);


module.exports = router;