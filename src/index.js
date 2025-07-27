const express = require("express");
const { dbConnect } = require("./config");
const { appConfig } = require("./app/app");

const startServer = async () => {
  const app = express();
  await dbConnect();
  await appConfig(app);
};
startServer();
