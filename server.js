import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import productRoutes from "./Routes/productRoutes.js";
import errorHandler from "./Middleware/errorHandler.js";

dotenv.config();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Inventory Management API is Running");
});

app.use("/products", productRoutes);

app.use(errorHandler);

const startServer = async () => {
    await connectDB();

    app.listen(process.env.PORT, () => {
        console.log(`Server running on port ${process.env.PORT}`);
    });
};

startServer();