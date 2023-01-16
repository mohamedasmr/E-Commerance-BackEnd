const Product = require("../models/Product");

exports.addProduct = async (req, res) => {
    const product = new Product(req.body);
    try {
        await product.save();
        res.status(201).send(product);
    } catch (e) {
        res.status(400).send(e);
    }
};

exports.searchProducts = async (req, res) => {
    try {
        const product = await Product.find({});
        res.send(product);
    } catch (e) {
        res.status(500).send(e);
    }
};

exports.searchProductId = async (req, res) => {
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
};

exports.searchProductStatus = async (req, res) => {
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
};

exports.updateProduct = async (req, res) => {
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
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).send();
        }

        res.send("Product deleted....");
    } catch (e) {
        res.status(500).send(e);
    }
};

exports.deleteProductPic = async (req, res) => {
    req.product.pic = undefined;
    await req.product.save();
    res.send();
};

exports.viewProductPicById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product || !product.pic) {
            throw new Error();
        }
        res.set("Content-Type", "image/png");
        res.send(product.pic);
    } catch (e) {
        res.status(404).send(e);
    }
};
