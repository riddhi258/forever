import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    try {

        await mongoose.connect(process.env.URI);

        mongoose.connection.on("connected", () => {
            console.log("✅ MongoDB connected successfully");
        });

        mongoose.connection.on("error", (err) => {
            console.error("❌ MongoDB connection error:", err);
        });

    } catch (err) {
        console.error("❌ Initial MongoDB connection error:", err);
        process.exit(1);
    }
};

export default connectDB;
