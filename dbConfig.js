const mongoose = require("mongoose");

exports.connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGOURI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Mongoose DB Connection error:", err);
  }
};

exports.closeDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("Mongoose DB connections closed.");
  } catch (err) {
    console.error("Mongoose DB Disconnect error:", err);
  }
}