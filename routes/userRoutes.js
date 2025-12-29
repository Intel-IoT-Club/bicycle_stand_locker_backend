const express = require("express");
const { signup, login, getmydata, forgotPassword, resetPassword } = require("../controllers/userController");
const router = express.Router();
const auth = require("../middlewares/authenticate");

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", auth, getmydata);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
