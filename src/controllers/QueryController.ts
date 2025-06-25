import { Request, Response } from "express";
import Query from "../models/Query";

const getMyQuery = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.userId;

    const myQueries = await Query.find({ user: userId });

    return res.status(200).json(myQueries); // Always return 200 with array
  } catch (error) {
    console.error("Error fetching queries", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const createQuery = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.userId; // Ensure middleware adds this
    const { subject, describeSubject } = req.body;

    if (!subject || !describeSubject) {
      return res.status(400).json({
        success: false,
        message: "Subject and description are required",
      });
    }

    const newQuery = new Query({
      user: userId,
      subject,
      describeSubject,
    });

    await newQuery.save();

    res.status(201).json(newQuery);
  } catch (error) {
    console.error("Error creating query:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error. Failed to create query",
    });
  }
};

export default {
  createQuery,
  getMyQuery,
};
