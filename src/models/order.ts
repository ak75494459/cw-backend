import mongoose from "mongoose";

/**
 * ✅ Schema for a single item in an order
 */
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Products",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  size: {
    type: String, // e.g., "M", "L", "XL"
  },
});

/**
 * ✅ Schema for Razorpay Payment Details
 */
const paymentDetailsSchema = new mongoose.Schema(
  {
    razorpay_payment_id: String,
    razorpay_order_id: String,
    razorpay_signature: String,
  },
  { _id: false }
);

/**
 * ✅ Main Order Schema
 */
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: [
        (array: any[]) => array.length > 0,
        "Order must have at least one item.",
      ],
    },

    shippingAddress: {
      fullName: {
        type: String,
        required: true,
        trim: true,
      },
      phoneNumber: {
        type: String,
        required: true,
        match: /^[6-9]\d{9}$/,
      },
      addressLine1: {
        type: String,
        required: true,
      },
      addressLine2: String,
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      pincode: {
        type: String,
        required: true,
        match: /^\d{6}$/,
      },
      country: {
        type: String,
        default: "India",
      },
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Ordered",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Return",
        "Returned",
        "Refunded",
      ],
      default: "Pending",
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["Prepaid", "Cash on Delivery"],
      required: true,
    },

    paymentDetails: paymentDetailsSchema, // ✅ Razorpay payment info
  },

  { timestamps: true }
);

/**
 * ✅ Create and export the Order model
 */
const Order = mongoose.model("Order", orderSchema);
export default Order;
