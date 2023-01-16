const express = require("express");
const router = new express.Router();
const userController = require("../controllers/user-controller");
const cors = require("cors");
const { auth, isAdmin } = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");

router.use(
    cors({
        origin: "*",
    })
);

// Create User
router.post("/users", userController.addUser);

// Login User
router.post("/users/login", userController.loginUser);

// Logout User
router.post("/users/logout", auth, userController.logoutUser);

// Logout All
router.post("/users/logoutAll", isAdmin, userController.logoutAll);

// View Data
router.get("/users/me", auth, userController.viewData);

// Update User
router.patch("/users/me", auth, userController.updateUser);

// Delete Users
router.delete("/users/me", auth, userController.deleteUser);

//GET USER STATS

router.get("/status", isAdmin, userController.userStatus);

// User Profile Pic
const upload = multer({
    limits: {
        fileSize: 20000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error("Please upload a photo"));
        }
        cb(undefined, true);
    },
});

// Upload Pic
router.post(
    "/users/me/pic",
    auth,
    upload.single("pic"),
    async (req, res) => {
        const buffer = await sharp(req.file.buffer)
            .resize({ width: 250, height: 250 })
            .png()
            .toBuffer();

        req.user.pic = buffer;
        await req.user.save();
        res.send();
    },
    (error, req, res, next) => {
        res.status(400).send({ error: error.message });
    }
);

// Delete Pic
router.delete("/users/me/pic", auth, userController.deletePic);

// View pic by id
router.get("/users/:id/pic", userController.viewPic);

module.exports = router;
