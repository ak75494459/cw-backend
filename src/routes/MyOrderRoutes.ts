import { Router } from "express";
import { jwtCheck, jwtParse } from "../middleware/auth";
import MyOrderController from "../controllers/MyOrderController";

const router = Router();

router.post("/", jwtCheck, jwtParse, MyOrderController.createOrder);
router.get("/details", jwtCheck, jwtParse, MyOrderController.getMyOrders);
router.patch("/", jwtCheck, jwtParse, MyOrderController.updateOrderStatus);

export default router;
