import express from "express";
import MyAddressController from "../controllers/MyAddressController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import multer from "multer";

const router = express.Router();
const upload = multer();

router.post(
  "/",
  jwtCheck,
  jwtParse,
  upload.none(),
  MyAddressController.createAddress
);

router.get("/", jwtCheck, jwtParse, MyAddressController.getAddress);

export default router;
