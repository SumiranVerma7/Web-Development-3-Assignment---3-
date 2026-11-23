const validateProduct = (req, res, next) => {
    const data = req.body;

    if (req.method === "POST") {
        if (!data.name || !data.sku || !data.category || data.price === undefined) {
            return res.status(400).json({
                message: "Name, SKU, category and price are required"
            });
        }
    }

    if (data.price !== undefined && data.price < 0) {
        return res.status(400).json({
            message: "Price cannot be negative"
        });
    }

    if (data.quantity !== undefined && data.quantity < 0) {
        return res.status(400).json({
            message: "Quantity cannot be negative"
        });
    }

    if (data.lowStockThreshold !== undefined && data.lowStockThreshold < 0) {
        return res.status(400).json({
            message: "Threshold cannot be negative"
        });
    }

    next();
};

export default validateProduct;