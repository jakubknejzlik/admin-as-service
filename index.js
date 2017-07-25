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

let configuration = null;

try {
  configuration = yaml.safeLoad(
    fs.readFileSync(
      path.join(__dirname, process.env.CONFIG_FILE || "config.yml")
    )
  );
} catch (err) {
  throw new Error("could not serve config: " + err.message);
}

app.get("/config.js", (req, res, next) => {
  res
    .type("application/javascript")
    .send(`window.CONFIG = ${JSON.stringify(configuration)}`);
});
app.use("/", express.static(path.join(__dirname, "static")));

const port = process.env.PORT || 8080;
app.listen(port, err => {
  console.log(`listening on ${port}, error: ${err}`);
});
