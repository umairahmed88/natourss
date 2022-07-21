const express = require("express");

const router = express.Router();

const userController = require("../controller/userController");

router
	.route("/")
	.get(userController.getAllUsers)
	.get(userController.createUser);

router
	.route("/:id")
	.get(userController.getUser)
	.patch(userController.updateUser)
	.delete(userController.deleteUser);

module.exports = router;
