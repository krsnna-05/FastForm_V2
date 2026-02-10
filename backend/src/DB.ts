import { connect } from "mongoose";

export const connectDB = async () => {
  try {
    await connect(process.env.MONGODB_URI!)
      .then(() => {
        console.log("MongoDB connection established 😆");
      })
      .catch((error) => {
        console.error("MongoDB connection error:", error);
        throw error;
      });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
};
