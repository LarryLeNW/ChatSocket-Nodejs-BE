const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/users/:id", userController.getUser);
router.get("/users", userController.getUser);

module.exports = router;
