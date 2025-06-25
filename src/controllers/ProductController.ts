import { Request, Response } from "express";
import User from "../models/user";
import Product from "../models/products";
import cloudinary from "cloudinary";

const getProduct = async (req: Request, res: Response): Promise<any> => {
  try {
    const product = await Product.findOne({ _id: req.params.id });
    res.json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error in getting products" });
  }
};

const getProducts = async (req: Request, res: Response): Promise<any> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 8;
    let query: any = {};
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    const total = await Product.countDocuments(query);
    res.json({
      data: products,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error in getting products" });
  }
};

// Main product creation controller
const createProduct = async (req: Request, res: Response): Promise<any> => {
  try {
    // Step 1: Find the user (admin/owner)
    const mainController = await User.findById(req.userId);

    if (!mainController) {
      return res.status(404).json({ message: "User not found" });
    }

    // Step 2: Check if user is authorized to add products
    const owner = mainController._id;
    if (owner.toString() !== process.env.PRODUCTS_CID) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // Step 3: Check for uploaded files
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Step 4: Upload all files to Cloudinary
    const imageUrls = await Promise.all(files.map(uploadImage));

    // Step 5: Create new product with form data and image URLs
    const product = new Product({
      ...req.body,
      productImages: imageUrls, // Field must match schema
      createdAt: new Date(),
    });

    await product.save();

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Cloudinary image upload helper
const uploadImage = async (file: Express.Multer.File): Promise<string> => {
  try {
    const base64Image = Buffer.from(file.buffer).toString("base64");
    const dataURI = `data:${file.mimetype};base64,${base64Image}`;

    const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
    return uploadResponse.secure_url; // Use HTTPS link
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Image upload failed");
  }
};

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const searchQuery = (req.query.searchQuery as string) || "";
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 8;
    const skip = (page - 1) * pageSize;

    const colorQuery = req.query.color;
    const categoryQuery = req.query.category;
    const genderQuery = req.query.gender;
    const collectionsQuery = req.query.collections;

    // Normalize query parameters to arrays
    const colors: string[] = Array.isArray(colorQuery)
      ? colorQuery.map(String)
      : colorQuery
      ? [String(colorQuery)]
      : [];

    const categories: string[] = Array.isArray(categoryQuery)
      ? categoryQuery.map(String)
      : categoryQuery
      ? [String(categoryQuery)]
      : [];

    const genders: string[] = Array.isArray(genderQuery)
      ? genderQuery.map(String)
      : genderQuery
      ? [String(genderQuery)]
      : [];

    const collections: string[] = Array.isArray(collectionsQuery)
      ? collectionsQuery.map(String)
      : collectionsQuery
      ? [String(collectionsQuery)]
      : [];

    const rawPrice = req.query.price;
    const price =
      rawPrice && !isNaN(Number(rawPrice)) ? Number(rawPrice) : undefined;

    // Build MongoDB query object
    const query: any = {};

    // Search by text
    if (searchQuery) {
      const regex = new RegExp(searchQuery, "i");
      query["$or"] = [
        { productName: regex },
        { brand: regex },
        { category: regex },
        { productDescription: regex },
        { colors: { $in: [regex] } },
        { gender: regex },
        { collections: regex }, // optional inclusion in searchQuery matching
      ];
    }

    // Filter by colors
    if (colors.length > 0) {
      query["colors"] = {
        $in: colors.map((color) => new RegExp(`^${color}$`, "i")),
      };
    }

    // Filter by category
    if (categories.length > 0) {
      query["category"] = {
        $in: categories.map((cat) => new RegExp(`^${cat}$`, "i")),
      };
    }

    // Filter by gender
    if (genders.length > 0) {
      query["gender"] = {
        $in: genders.map((g) => new RegExp(`^${g}$`, "i")),
      };
    }

    // ✅ Filter by collections
    if (collections.length > 0) {
      query["collections"] = {
        $in: collections.map((col) => new RegExp(`^${col}$`, "i")),
      };
    }

    // Filter by price (≤ max)
    if (price !== undefined) {
      query["price"] = { $lte: price };
    }

    // Fetch filtered, paginated products
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const total = await Product.countDocuments(query);

    res.json({
      data: products,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / pageSize),
      },
    });

    // Debug
    console.log("Query filters:", {
      colors,
      categories,
      genders,
      collections,
      price,
    });
    console.log("Mongo Query:", JSON.stringify(query, null, 2));
  } catch (error) {
    console.error("Error while searching products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default {
  createProduct,
  getProducts,
  searchProducts,
  getProduct,
};
