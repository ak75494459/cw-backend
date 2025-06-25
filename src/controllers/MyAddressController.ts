import { Request, Response } from "express";
import { UserAddress } from "../models/UserAddress";

export const getAddress = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.userId; // Auth0 user ID from middleware

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const addresses = await UserAddress.findOne({ user: userId });

    res.status(200).json(addresses);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const {
      fullName,
      phoneNumber,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      country,
      isDefault,
    } = req.body;

    let userAddressDoc = await UserAddress.findOne({ user: userId });

    const newAddress = {
      fullName,
      phoneNumber,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      country,
      isDefault: isDefault || false,
    };

    if (!userAddressDoc) {
      userAddressDoc = new UserAddress({
        user: userId,
        addresses: [newAddress],
      });
    } else {
      userAddressDoc.addresses.push(newAddress);
    }

    await userAddressDoc.save();
    res.status(200).json({ success: true, data: userAddressDoc });
  } catch (error) {
    console.error("Error creating address:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create address" });
  }
};

export default {
  createAddress,
  getAddress,
};
