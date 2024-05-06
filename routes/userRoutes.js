const express = require("express");
const {
    signUp, getUsers, signIn, getToken, verifyToken,updateUsers,
    deleteUsers

} = require("../controllers/userController");


const router = express.Router();




router.post("/signup", signUp);
router.post("/signin", signIn);
router.get("/", getUsers);
router.put("/", updateUsers);
router.delete("/", deleteUsers);

module.exports = router;
