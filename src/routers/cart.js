const express = require("express");
const router = new express.Router();
const Cart = require("../models/Cart");
const { auth, isAdmin } = require("../middleware/auth");

// Create Cart
router.post("/cart", auth, async (req, res) => {
    const cart = new Cart({
        ...req.body,
        owner: req.user._id,
    });
    try {
        await cart.save();
        res.status(201).send(cart);
    } catch (e) {
        res.status(400).send(e);
    }
});

// Search by Cart Id
router.get("/cart/:id", auth, async (req, res) => {
    try {
        const cart = await Cart.find({ _id, owner: req.params._id });

        if (!cart) {
            return res.status(404).send(e);
        }

        res.send(cart);
    } catch (e) {
        res.status(500).send(e);
    }
});
// Search All Carts
router.get("/cart", isAdmin, async (req, res) => {
    try {
        const cart = await Cart.find();
        res.status(200).send(cart);
    } catch (e) {
        res.status(500).send(e);
    }
});
// Update Cart

router.patch("/cart/:id", auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["quantity"];
    const isValidOperation = updates.every((update) =>
        allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid updates!" });
    }

    try {
        const cart = await Cart.findOne({
            _id: req.params.id,
            owner: req.user._id,
        });

        updates.forEach((update) => (cart[update] = req.body[update]));
        await cart.save();

        if (!cart) {
            return res.status(404).send(e);
        }

        res.send(cart);
    } catch (e) {
        res.status(400).send(e);
    }
});

// Delete Cart

router.delete("/cart/:id", auth, async (req, res) => {
    try {
        const cart = await Cart.findByIdAndDelete(req.params.id);

        if (!cart) {
            return res.status(404).send();
        }

        res.send("Cart deleted....");
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;
