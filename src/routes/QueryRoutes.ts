import express from "express";
import { jwtCheck, jwtParse } from "../middleware/auth";
import multer from "multer";
import QueryController from "../controllers/QueryController";

const router = express.Router();
const upload = multer();

router.post(
  "/",
  jwtCheck,
  jwtParse,
  upload.none(),
  QueryController.createQuery
);

router.get("/", jwtCheck, jwtParse, QueryController.getMyQuery);

export default router;
