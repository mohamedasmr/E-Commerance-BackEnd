const express = require("express");
const router = new express.Router();
const { auth, isAdmin } = require("../middleware/auth");
const orderController = require("../controllers/order-controller");

// Create Order
router.post("/order", auth, orderController.addOrder);

// Search by Cart Id
router.get("/order/:userId", auth, orderController.searchByCartId);

// Search All Carts
router.get("/order", isAdmin, orderController.searchOrders);

// Update Order
router.patch("/order/:id", auth, orderController.updateOrder);

// Delete Order
router.delete("/order/:id", isAdmin, orderController.deleteOrder);

// Get monthely income
router.get("/income", isAdmin, orderController.getIncome);

module.exports = router;
