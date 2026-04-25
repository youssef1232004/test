const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Connect to MongoDB using the URI from the .env file
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🟢 [DATABASE] Successfully connected to MongoDB');
    } catch (error) {
        console.error('🔴 [DATABASE ERROR] Connection failed:', error.message);
        // If the database fails to connect, stop the server completely
        process.exit(1); 
    }
};

module.exports = connectDB;