"use strict";

const fs = require("fs");
const path = require("path");
const express = require("express");
const yaml = require("js-yaml");
const Router = express.Router;

const app = express();

app.get("/", (req, res, next) => {
  req.url = "/index.html";
  next();
});

app.get("/config.js", (req, res, next) => {
  const conf = yaml.safeLoad(
    fs.readFileSync(path.join(__dirname, "example/simple.config.yml"))
  );
  res
    .type("application/javascript")
    .send(`window.CONFIG = ${JSON.stringify(conf)}`);
});
app.use("/", express.static(path.join(__dirname, "static")));

const port = process.env.PORT || 8080;
app.listen(port, err => {
  console.log(`listening on ${port}, error: ${err}`);
});
