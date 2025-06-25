import express from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import MyUserRoute from "./routes/MyUserRoutes";
import { v2 as cloudinary } from "cloudinary";
import ProductRoutes from "./routes/ProductRoutes";
import MyCartRoutes from "./routes/MyCartRoutes";
import MyAddressRoutes from "./routes/MyAddressRoutes";
import QueryRoutes from "./routes/QueryRoutes";

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then(() => console.log("connected to database!"));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.ClOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/my/user", MyUserRoute);
app.use("/api/products", ProductRoutes);
app.use("/api/cart", MyCartRoutes);
app.use("/api/my/address", MyAddressRoutes);
app.use("/api/my/query", QueryRoutes);

app.listen(8000, () => {
  console.log("app is listening in port 8000");
});
