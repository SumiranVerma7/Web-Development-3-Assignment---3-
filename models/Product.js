import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    sku: {
        type: String,
        required: true,
        unique: true
    },

    description: {
        type: String,
        default: ""
    },

    category: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    quantity: {
        type: Number,
        default: 0,
        min: 0
    },

    lowStockThreshold: {
        type: Number,
        default: 10,
        min: 0
    }
}, {
    timestamps: true
});

const Product = mongoose.model("Product", productSchema);

export default Product;