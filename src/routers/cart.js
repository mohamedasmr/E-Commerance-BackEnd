const express = require("express");
const router = new express.Router();
const { auth, isAdmin } = require("../middleware/auth");
const cartController = require("../controllers/cart-controller");

// Create Cart
router.post("/cart", auth, cartController.createCart);

// Search by Cart Id
router.get("/cart/:id", auth, cartController.seacrchCart);

// Search All Carts
router.get("/cart", isAdmin, cartController.searchAllCarts);

// Update Cart
router.patch("/cart/:id", auth, cartController.updateCart);

// Delete Cart
router.delete("/cart/:id", auth, cartController.deleteCart);

module.exports = router;
