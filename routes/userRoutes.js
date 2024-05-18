const express = require("express");
const {
    signUp, getUsers, signIn, getToken, verifyToken,updateUsers,
    deleteUsers

} = require("../controllers/userController");


const router = express.Router();




router.post("/signup", signUp);
router.post("/signin", signIn);
router.get("/", getToken, verifyToken,getUsers);
router.put("/",getToken, verifyToken, updateUsers);
router.delete("/",getToken, verifyToken, deleteUsers);

module.exports = router;
