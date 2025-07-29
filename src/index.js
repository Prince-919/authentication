const express = require("express");
const cors = require("cors");
const { dbConnect } = require("./config");
const { appConfig } = require("./app/app");

const startServer = async () => {
  const app = express();
  const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };
  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));
  await dbConnect();
  await appConfig(app);
};
startServer();
