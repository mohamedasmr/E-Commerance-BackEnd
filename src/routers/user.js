const express = require("express");
const router = new express.Router();
const User = require("../models/User");
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
router.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

// Login User
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.username,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user: user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

// Logout User
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();

    res.send();
  } catch (e) {
    res.status(500).send(e);
  }
});

// Logout All
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

// View Profile
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

// Update User
router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["username", "password"];
  const isValidOpration = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOpration) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));

    await req.user.save();
    res.status(201).send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Delete Users
router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send("User deleted....");
  } catch (e) {
    res.status(500).send(e);
  }
});

//GET USER STATS

router.get("/status", isAdmin, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    const data = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).send(data);
  } catch (err) {
    res.status(500).send(err);
  }
});

// User Profile Pic
// const upload = multer({
//   limits: {
//     fileSize: 2000000,
//   },
//   fileFilter(req, file, cb) {
//     if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
//       return cb(new Error("Please upload a photo"));
//     }
//     cb(undefined, true);
//   },
// });

// router.post(
//   "/users/me/pic",
//   auth,
//   upload.single("pic"),
//   async (req, res) => {
//     const buffer = await sharp(req.file.buffer)
//       .resize({ width: 250, height: 250 })
//       .png()
//       .toBuffer();

//     req.user.pic = buffer;
//     await req.user.save();
//     res.send();
//   },
//   (error, req, res, next) => {
//     res.status(400).send({ error: error.message });
//   }
// );

// router.delete("/users/me/pic", auth, async (req, res) => {
//   req.user.pic = undefined;
//   await req.user.save();
//   res.send();
// });

// router.get("/users/:id/pic", async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);

//     if (!user || !user.pic) {
//       throw new Error();
//     }
//     res.set("Content-Type", "image/png");
//     res.send(user.pic);
//   } catch (e) {
//     res.status(404).send();
//   }
// });

module.exports = router;
