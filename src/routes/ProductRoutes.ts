import { jwtCheck, jwtParse } from "../middleware/auth";
import multer from "multer";
import express from "express";
import sharp from "sharp";
import ProductController from "../controllers/ProductController";

const router = express.Router();
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const uploadMiddleware = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  upload.array("productImageFile", 10)(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ error: "File size too large! Max 10MB allowed." });
      }
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({ error: "Unexpected file field name." });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      if (!req.files) return next();

      const files = req.files as Express.Multer.File[];

      // Process images with Sharp (resize & compress)
      req.files = await Promise.all(
        files.map(async (file) => {
          const resizedBuffer = await sharp(file.buffer)
            .resize({ width: 1080 }) // Resize to 1080px width
            .jpeg({ quality: 70 }) // Convert to JPEG with 70% quality
            .toBuffer();

          return {
            ...file,
            buffer: resizedBuffer, // Replace original buffer with compressed buffer
            mimetype: "image/jpeg",
          };
        })
      );

      next();
    } catch (error) {
      return res.status(500).json({ error: "Error processing images." });
    }
  });
};

router.post(
  "/",
  jwtCheck,
  jwtParse,
  uploadMiddleware,
  ProductController.createProduct
);
router.get("/", ProductController.getProducts);

router.get("/search", ProductController.searchProducts);

router.get("/:id", ProductController.getProduct);

export default router;
