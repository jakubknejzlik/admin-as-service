import React from "react";
import CustomDashboard from "./custom/Dashboard";
import config from "./config";

// var users = require("./views/users");
// var sections = require("./views/sections");
// var categories = require("./views/categories");
// var tags = require("./views/tags");
// var entries = require("./views/entries");
var { login } = require("./views/login");
var { createViews } = require("./views/views");
var { createConnectorFactory } = require("./connectors");

const OPTIONS = {
  debug: false,
  basePath: config.basePath,
  baseURL: config.url
};

const connectorFactory = createConnectorFactory(config.apiType, config.url);

for (let entityName in config.entities) {
  let entity = config.entities[entityName];
  entity.connector = connectorFactory.connectorForEntity(entity);
}

var admin = {};
admin.title = config.title;
admin.options = OPTIONS;
admin.views = createViews(config.entities);
admin.auth = { login: login(config.auth) };
admin.custom = { dashboard: CustomDashboard };
admin.id = "admin-as-service";
// admin.messages =
// {
// "login.button": "Sign in",
// "logout.button": "Sign out",
// "logout.affirmation": "Have a nice day!",
// pageNotFound: "Sorry, page not found."
// };

export default admin;
