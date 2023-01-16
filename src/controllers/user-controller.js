const User = require("../models/User");

exports.addUser = async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }
};

exports.loginUser = async (req, res) => {
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
};

exports.logoutUser = async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();

        res.send();
    } catch (e) {
        res.status(500).send(e);
    }
};

exports.logoutAll = async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
};

exports.viewData = async (req, res) => {
    res.send(req.user);
};

exports.updateUser = async (req, res) => {
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
};

exports.deleteUser = async (req, res) => {
    try {
        await req.user.remove();
        res.send("User deleted....");
    } catch (e) {
        res.status(500).send(e);
    }
};

exports.userStatus = async (req, res) => {
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
};

exports.deletePic = async (req, res) => {
    req.user.pic = undefined;
    await req.user.save();
    res.send();
};

exports.viewPic = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.pic) {
            throw new Error();
        }
        res.set("Content-Type", "image/png");
        res.send(user.pic);
    } catch (e) {
        res.status(404).send();
    }
};
