import mongoose from "mongoose";

export const connectDB = async()=>{

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`Database connected on ${conn.connection.host}`);
        
    } catch (error) {
        console.error(`CRITICAL: Database connection failed!`, error.message);
        console.error(`Please check your MONGO_URI in the .env file and ensure your IP is whitelisted on MongoDB Atlas.`);
        // Don't exit process, let the server stay up so health checks can still report error status if needed
    }
}