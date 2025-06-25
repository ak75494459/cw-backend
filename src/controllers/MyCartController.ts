import { Request, Response } from "express";
import Cart from "../models/cart";
import Product from "../models/products";

const getCartData = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.userId;

    const cartData = await Cart.findOne({ user: userId }).populate(
      "items.product"
    );

    return res.status(200).json(cartData);
  } catch (error) {
    console.error("Error getting cart:", error);
    return res.status(500).json({ message: "Failed to retrieve cart" });
  }
};

const createOrUpdateCart = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = req.userId;
    const { product, quantity, size } = req.body;

    // Check if product exists
    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find existing cart
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      // Create new cart
      cart = new Cart({
        user: userId,
        items: [{ product, quantity, size }],
      });
    } else {
      // Check if item with same product and size exists
      const existingItemIndex = cart.items.findIndex(
        (item) => item.product.toString() === product && item.size === size
      );

      if (existingItemIndex !== -1) {
        // If item exists, update quantity
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        // Else, push new item
        cart.items.push({ product, quantity, size });
      }
    }

    await cart.save();
    return res.status(200).json({ message: "Cart updated", cart });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteCartItem = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.userId; // ✅ Ensure this is set by middleware like auth
    const { productId, size } = req.body;

    // 🔒 Validate inputs
    if (!productId || !size) {
      return res
        .status(400)
        .json({ message: "Product ID and size are required" });
    }

    // ✅ Remove matching item from user's cart
    const updatedCart = await Cart.findOneAndUpdate(
      { user: userId },
      { $pull: { items: { product: productId, size: size } } },
      { new: true }
    ).populate("items.product"); // ✅ optional for frontend use

    // ✅ Check if cart was found
    if (!updatedCart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    return res.status(200).json({
      message: "Item removed from cart",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default { createOrUpdateCart, getCartData, deleteCartItem };
