const mongoose = require('mongoose');

const connectDB = async () => {
    if (!process.env.MONGODB_URI) {
        console.error('FATAL ERROR: MONGODB_URI environment variable is not defined.');
        console.error('Please set MONGODB_URI in your Render Environment Variables.');
        process.exit(1);
    }

    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.info(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
