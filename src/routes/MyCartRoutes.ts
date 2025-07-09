import express from "express";
import MyCartController from "../controllers/MyCartController";
import { jwtCheck, jwtParse } from "../middleware/auth";

const router = express.Router();

router.post("/", jwtCheck, jwtParse, MyCartController.createOrUpdateCart);
router.get("/", jwtCheck, jwtParse, MyCartController.getCartData);
router.delete("/", jwtCheck, jwtParse, MyCartController.deleteCartItem);
router.post(
  "/change-quantity",
  jwtCheck,
  jwtParse,
  MyCartController.changeCartItemQuantity
);

export default router;
