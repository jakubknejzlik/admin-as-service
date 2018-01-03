"use strict";

const fs = require("fs");
const path = require("path");
const express = require("express");
const yaml = require("js-yaml");
const gracefulExit = require("express-graceful-exit");
const Router = express.Router;

const app = express();

app.use(gracefulExit.middleware(app));

app.get("/", (req, res, next) => {
  req.url = "index.html";
  next();
});

const interpolateEnvVars = string => {
  for (let key in process.env) {
    let value = process.env[key];
    string = string.replace(new RegExp(`\\\${${key}}`, "gi"), value);
  }
  return string.replace(new RegExp(`\\\${[^\\}]*}`, "gi"), "");
};

const getConfig = () => {
  let content = null;
  if (process.env.CONFIG) {
    try {
      content = new Buffer(process.env.CONFIG, "base64").toString("utf-8");
    } catch (err) {
      content = process.env.CONFIG;
    }
  } else {
    content = fs.readFileSync(
      path.join(__dirname, process.env.CONFIG_FILE || "config.yml"),
      "utf-8"
    );
  }
  content = interpolateEnvVars(content);

  return content;
};

const getConfiguration = async () => {
  if (process.env.NODE_ENV !== "production") {
    return yaml.safeLoad(getConfig());
  }

  let configuration = null;

  try {
    configuration = yaml.safeLoad(getConfig());
  } catch (err) {
    throw new Error("could not serve config: " + err.message);
  }
  return configuration;
};

app.get("/config.js", (req, res, next) => {
  getConfiguration()
    .then(configuration => {
      res
        .type("application/javascript")
        .send(`window.CONFIG = ${JSON.stringify(configuration)}`);
    })
    .catch(next);
});

app.use("/static", express.static(path.join(__dirname, "static")));

const indexFile = fs.readFileSync("./static/index.html").toString();
app.get("*", (req, res, next) => {
  getConfiguration()
    .then(config => {
      let content = indexFile.replace("${BASE_PATH}", config.basePath || "/");
      content = content.replace("${TITLE}", config.title);
      res.type("html").send(content);
    })
    .catch(next);
});

const port = process.env.PORT || 80;
app.listen(port, err => {
  console.log(`listening on ${port}, error: ${err}`);
});
