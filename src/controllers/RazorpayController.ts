import { Request, Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY || "",
  key_secret: process.env.RAZORPAY_SECRET || "",
});

const createOrder = async (req: Request, res: Response): Promise<any> => {
  try {
    const { amount, currency, receipt, notes } = req.body;

    if (!amount || !receipt) {
      return res.status(400).json({
        success: false,
        message: "Amount and receipt are required",
      });
    }

    const options = {
      amount,
      currency,
      receipt,
      notes,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).json({
        success: false,
        message: "Failed to create Razorpay order",
      });
    }

    return res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Failed to create Razorpay order.",
    });
  }
};

const validatePayment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment details",
      });
    }

    const sha = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET!);
    sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = sha.digest("hex");

    if (digest !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Transaction is not legit!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment signature verified successfully",
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error("Error validating payment:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Failed to validate payment.",
    });
  }
};

export default {
  createOrder,
  validatePayment,
};
