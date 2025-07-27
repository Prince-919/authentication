const mongoose = require("mongoose");
const config = require("./config");

const dbConnect = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("connected to database successfully.");
    });
    mongoose.connection.on("error", (err) => {
      console.error("Error connecting to database.", err);
    });
    await mongoose.connect(config.get("databaseUrl"));
  } catch (error) {
    console.log("Failed to connect to database.", error);
    process.exit(1);
  }
};
module.exports = dbConnect;
