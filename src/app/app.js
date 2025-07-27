const express = require("express");
const helmet = require("helmet");
const { authRoutes } = require("../routes");
const { config } = require("../config");
const errorHandler = require("../middlewares/error");

exports.appConfig = (app) => {
  const port = config.get("port") || 5000;
  app.use(helmet());
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  app.get("/", (req, res) => {
    res.status(200).json({
      success: true,
      message: "Welcome to the Authentication API",
    });
  });
  app.use(errorHandler);
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
};
