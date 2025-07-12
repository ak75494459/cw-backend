import express from "express";
import RazorpayController from "../controllers/RazorpayController";
import { jwtCheck, jwtParse } from "../middleware/auth";

const router = express.Router();

router.post("/", jwtCheck, jwtParse, RazorpayController.createOrder);
router.post(
  "/validate",
  jwtCheck,
  jwtParse,
  RazorpayController.validatePayment
);

export default router;
