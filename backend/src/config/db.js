const mongoose = require("mongoose");
const { mongoUri } = require("./env");

const connectDB = async () => {
    if (!mongoUri) {
        throw new Error("MONGO_URI is not set in the environment");
    }

    await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
};

module.exports = connectDB;
