import express from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import Razorpay from "razorpay";
import { v2 as cloudinary } from "cloudinary";
import { Request, Response } from "express";
import crypto from "crypto";

import MyUserRoute from "./routes/MyUserRoutes";
import ProductRoutes from "./routes/ProductRoutes";
import MyCartRoutes from "./routes/MyCartRoutes";
import MyAddressRoutes from "./routes/MyAddressRoutes";
import QueryRoutes from "./routes/QueryRoutes";
import RazorpayRoutes from "./routes/RazorpayRotutes";

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then(() => console.log("✅ Connected to database"));

// ✅ Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.ClOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ✅ Register routes
app.use("/api/my/user", MyUserRoute);
app.use("/api/products", ProductRoutes);
app.use("/api/cart", MyCartRoutes);
app.use("/api/my/address", MyAddressRoutes);
app.use("/api/my/query", QueryRoutes);
app.use("/order", RazorpayRoutes);

// ✅ Start Server
app.listen(8000, () => {
  console.log("✅ Server listening on port 8000");
});
