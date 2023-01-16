const Order = require("../models/Order");
const User = require("../models/User");

exports.addOrder = async (req, res) => {
    const order = new Order({
        ...req.body,
        owner: req.user._id,
    });
    try {
        await order.save();
        res.status(201).send(order);
    } catch (e) {
        res.status(400).send(e);
    }
};

exports.searchByCartId = async (req, res) => {
    try {
        const order = await Order.find({ userId: req.params.userId });

        if (!order) {
            return res.status(404).send(e);
        }

        res.send(order);
    } catch (e) {
        res.status(500).send(e);
    }
};

exports.searchOrders = async (req, res) => {
    try {
        const order = await Order.find();
        res.status(200).send(order);
    } catch (e) {
        res.status(500).send(e);
    }
};

exports.updateOrder = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["amount", "address"];
    const isValidOperation = updates.every((update) =>
        allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid updates!" });
    }

    try {
        const order = await Order.findById(req.params.id);

        updates.forEach((update) => (order[update] = req.body[update]));
        await product.save();

        if (!order) {
            return res.status(404).send();
        }

        res.send(order);
    } catch (e) {
        res.status(400).send(e);
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            return res.status(404).send();
        }

        res.send("Order deleted....");
    } catch (e) {
        res.status(500).send(e);
    }
};

exports.getIncome = async (req, res) => {
    const date = new Date();
    const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
    const previousMonth = new Date(
        new Date().setMonth(lastMonth.getMonth() - 1)
    );

    try {
        const income = await Order.aggregate([
            { $match: { createdAt: { $gte: previousMonth } } },
            {
                $project: {
                    month: { $month: "$createdAt" },
                    sales: "$amount",
                },
            },
            {
                $group: {
                    _id: "$month",
                    total: { $sum: "$sales" },
                },
            },
        ]);
        res.status(200).send(income);
    } catch (e) {
        res.status(500).send(e);
    }
};
