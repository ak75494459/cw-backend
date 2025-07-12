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

    const { items, shippingAddress, totalAmount, paymentDetails } = req.body;

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
      status: paymentDetails ? "Paid" : "Pending",
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

export default { createOrder, getMyOrders };
