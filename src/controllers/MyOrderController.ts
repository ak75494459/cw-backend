import { Request, Response } from "express";
import Order from "../models/order";
import { Types } from "mongoose";

/**
 * ✅ Create a new order
 */
const createOrder = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.userId as Types.ObjectId | string;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized. User ID missing." });
    }

    const {
      items,
      shippingAddress,
      totalAmount,
      paymentDetails,
      paymentMethod,
    } = req.body;

    // ✅ Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Order must have at least one item." });
    }

    if (!shippingAddress) {
      return res.status(400).json({ message: "Shipping address is required." });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res
        .status(400)
        .json({ message: "Total amount must be greater than 0." });
    }

    // ✅ Create Order
    const newOrder = new Order({
      user: userId,
      items,
      shippingAddress,
      totalAmount,
      status: paymentDetails ? "Ordered" : "Pending",
      paymentMethod,
      paymentDetails: paymentDetails || undefined,
    });

    await newOrder.save();

    return res.status(201).json({
      message: "✅ Order created successfully.",
      order: newOrder,
    });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const getMyOrders = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.userId as string | Types.ObjectId;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized. User ID missing." });
    }

    const orders = await Order.find({ user: userId })
      .populate(
        "items.product",
        "productName price discount productImages brand"
      )
      .sort({ createdAt: -1 });

    return res.json({ orders });
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * ✅ Cancel an order using req.body.orderId and req.userId
 */
/**
 * ✅ Cancel an order using req.body.orderId and req.userId
 */
const updateOrderStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.userId as Types.ObjectId | string;
    const { orderId, action } = req.body; // 'cancel' | 'return'

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized. User ID missing." });
    }

    if (!orderId || !Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid or missing orderId." });
    }

    if (!["cancel", "return"].includes(action)) {
      return res
        .status(400)
        .json({ message: "Invalid action. Must be 'cancel' or 'return'." });
    }

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // 🛑 Validation checks
    if (action === "cancel") {
      if (order.status === "Cancelled") {
        return res.status(400).json({ message: "Order is already cancelled." });
      }

      if (["Return", "Returned"].includes(order.status)) {
        return res.status(400).json({
          message: "Cannot cancel a returned or return-in-progress order.",
        });
      }

      if (["Delivered", "Shipped", "Refunded"].includes(order.status)) {
        return res.status(400).json({
          message: `Cannot cancel a ${order.status.toLowerCase()} order.`,
        });
      }
    }

    if (action === "return") {
      if (["Return", "Returned"].includes(order.status)) {
        return res
          .status(400)
          .json({ message: "Order is already returned or in return process." });
      }

      if (order.status === "Cancelled") {
        return res
          .status(400)
          .json({ message: "Cannot return a cancelled order." });
      }

      if (order.status !== "Delivered") {
        return res
          .status(400)
          .json({ message: "Can only return a delivered order." });
      }
    }

    const newStatus = action === "cancel" ? "Cancelled" : "Return";

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId, user: userId },
      { status: newStatus },
      { new: true, runValidators: false }
    );

    return res.json({
      message: `✅ Order ${
        action === "cancel" ? "cancelled" : "marked for return"
      } successfully.`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("❌ Error updating order:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export default { createOrder, getMyOrders, updateOrderStatus };
