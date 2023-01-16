const express = require("express");
const router = new express.Router();
const { isAdmin } = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const productController = require("../controllers/product-controller");

// Create Product
router.post("/products", isAdmin, productController.addProduct);

// Search All Products

router.get("/products", productController.searchProducts);

// Search by Product Id
router.get("/products/:id", productController.searchProductId);

// Search Product By status
router.get("/search/:key", productController.searchProductStatus);

// Update Product

router.patch("/products/:id", isAdmin, productController.updateProduct);

// Delete Product

router.delete("/products/:id", isAdmin, productController.deleteProduct);

// Product Profile Pic
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
    "/products/pic",
    isAdmin,
    upload.single("pic"),
    async (req, res) => {
        const buffer = await sharp(req.file.buffer)
            .resize({ width: 250, height: 250 })
            .png()
            .toBuffer();

        req.product.pic = buffer;
        await req.product.save();
        res.send();
    },
    (error, req, res, next) => {
        res.status(400).send({ error: error.message });
    }
);

// Delete Pic
router.delete("/products/pic", isAdmin, productController.deleteProductPic);

// View pic by id
router.get("/products/:id/pic", productController.viewProductPicById);

module.exports = router;
