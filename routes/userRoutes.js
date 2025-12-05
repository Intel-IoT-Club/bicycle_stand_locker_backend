const express = require("express");
const {signup, login,getmydata} = require("../controllers/userController");
const router = express.Router();
const auth = require("../middlewares/authenticate");

router
    .route("/signup")
    .post(signup);
router
    .route("/login")
    .post(login);
router
    .route("/me")
    .get(auth,getmydata)

module.exports = router;
