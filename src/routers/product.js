const express = require("express");
const router = new express.Router();
const mongoose = require("mongoose");
const Product = require("../models/Product");
const { isAdmin } = require("../middleware/auth");

// Create Product
router.post("/products", isAdmin, async (req, res) => {
  const product = new Product(req.body);
  try {
    await product.save();
    res.status(201).send(product);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Search All Products

router.get("/products", async (req, res) => {
  try {
    const product = await Product.find({});
    res.send(product);
  } catch (e) {
    res.status(500).send(e);
  }
});

// Search by Product Id
router.get("/products/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const product = await Product.findById(_id);

    if (!product) {
      return res.status(404).send(e);
    }

    res.send(product);
  } catch (e) {
    res.status(500).send(e);
  }
});
// Search Product By status
router.get("/search/:key", async (req, res) => {
  try {
    const product = await Product.find({
      $or: [
        {
          title: { $regex: req.params.key },
        },
        {
          categories: { $regex: req.params.key },
        },
      ],
    });
    if (!product) {
      res.status(404).send(e);
    }

    res.send(product);
  } catch (e) {
    res.status(404).send(e);
  }
});

// Update Product

router.patch("/products/:id", isAdmin, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "title",
    "desc",
    "categories",
    "size",
    "color",
    "price",
  ];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    const product = await Product.findById(req.params.id);

    updates.forEach((update) => (product[update] = req.body[update]));
    await product.save();

    if (!product) {
      return res.status(404).send();
    }

    res.send(product);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Delete Product

router.delete("/products/:id", isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).send();
    }

    res.send("Product deleted....");
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
