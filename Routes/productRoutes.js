import express from "express";
import Product from "../models/Product.js";
import validateProduct from "../middleware/validateProduct.js";

const router = express.Router();


// Create Product
router.post("/", validateProduct, async (req, res, next) => {
    try {
        const product = await Product.create(req.body);

        res.status(201).json({
            message: "Product created successfully",
            product
        });
    } catch (error) {
        next(error);
    }
});


// Get All Products with Filtering, Sorting and Pagination
router.get("/", async (req, res, next) => {
    try {
        const { category, minPrice, maxPrice, sortBy, order, page, limit } = req.query;

        const filter = {};

        if (category) {
            filter.category = category;
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.price = {};

            if (minPrice !== undefined) {
                filter.price.$gte = Number(minPrice);
            }

            if (maxPrice !== undefined) {
                filter.price.$lte = Number(maxPrice);
            }
        }

        const sortField = sortBy || "createdAt";
        const sortOrder = order === "asc" ? 1 : -1;

        const pageNumber = Number(page) || 1;
        const limitNumber = Number(limit) || 10;
        const skip = (pageNumber - 1) * limitNumber;

        const products = await Product.find(filter)
            .sort({ [sortField]: sortOrder })
            .skip(skip)
            .limit(limitNumber);

        const total = await Product.countDocuments(filter);

        res.status(200).json({
            totalProducts: total,
            page: pageNumber,
            totalPages: Math.ceil(total / limitNumber),
            products
        });

    } catch (error) {
        next(error);
    }
});


// Low Stock Products
router.get("/low-stock", async (req, res, next) => {
    try {
        const products = await Product.find({
            $expr: {
                $lte: ["$quantity", "$lowStockThreshold"]
            }
        });

        res.status(200).json({
            count: products.length,
            products
        });
    } catch (error) {
        next(error);
    }
});


// Category-wise Inventory Summary
router.get("/summary/categories", async (req, res, next) => {
    try {
        const summary = await Product.aggregate([
            {
                $group: {
                    _id: "$category",
                    totalProducts: { $sum: 1 },
                    totalQuantity: { $sum: "$quantity" },
                    totalValue: {
                        $sum: {
                            $multiply: ["$price", "$quantity"]
                        }
                    }
                }
            }
        ]);

        res.status(200).json({
            summary
        });
    } catch (error) {
        next(error);
    }
});


// Get Product by ID
router.get("/:id", async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json(product);
    } catch (error) {
        next(error);
    }
});


// Update Product
router.put("/:id", validateProduct, async (req, res, next) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product updated successfully",
            product
        });
    } catch (error) {
        next(error);
    }
});


// Update Stock (Restock or Sale)
router.patch("/:id/stock", async (req, res, next) => {
    try {
        const { operation, quantity } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                message: "Enter a valid quantity"
            });
        }

        let product;

        if (operation === "restock") {
            product = await Product.findByIdAndUpdate(
                req.params.id,
                {
                    $inc: { quantity: Number(quantity) }
                },
                { new: true }
            );
        } else if (operation === "sale") {
            product = await Product.findOneAndUpdate(
                {
                    _id: req.params.id,
                    quantity: { $gte: Number(quantity) }
                },
                {
                    $inc: { quantity: -Number(quantity) }
                },
                { new: true }
            );

            if (!product) {
                return res.status(400).json({
                    message: "Product not found or insufficient stock"
                });
            }
        } else {
            return res.status(400).json({
                message: "Operation must be restock or sale"
            });
        }

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Stock updated successfully",
            product
        });
    } catch (error) {
        next(error);
    }
});


// Delete Product
router.delete("/:id", async (req, res, next) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product deleted successfully"
        });
    } catch (error) {
        next(error);
    }
});

export default router;