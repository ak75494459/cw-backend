import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    trim: true,
  },
  brand: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  sizes: {
    type: [String], // e.g., ["S", "M", "L", "XL"]
  },

  colors: {
    type: [String], // e.g., ["Red", "Blue", "Black"]
    default: [],
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String, // e.g., "T-Shirt", "Jeans", "Jacket"
    required: true,
  },
  gender: {
    type: String,
    enum: ["Men", "Women", "Unisex"],
    required: true,
  },
  productDescription: {
    type: String,
    required: true,
  },
  productImages: {
    type: [String], // array of image URLs
    default: [],
  },
  discount: {
    type: Number,
    required: true,
  },
  collections: {
    type: String,
    required: true,
  },
  bestSeller: {
    type: Boolean,
    default: false,
  },
  isFeatured: {
    type: Boolean, // ads products
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model("Products", productSchema);

export default Product;
