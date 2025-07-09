import mongoose from "mongoose";

const connectDB = async () => {
    try {
        // MongoDB connection options for better performance and reliability
        const options = {
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000 // Close sockets after 45 seconds of inactivity
        };

        mongoose.connection.on('connected', () => console.log("Database Connected"));
        mongoose.connection.on('error', (err) => console.log("Database Error:", err));
        mongoose.connection.on('disconnected', () => console.log("Database Disconnected"));

        await mongoose.connect(`${process.env.MONGODB_URI}/car-rental`, options);
        
        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('Database connection closed due to app termination');
            process.exit(0);
        });

    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1);
    }
}

export default connectDB;