import jwt from "jsonwebtoken";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

import {
  createFrontendConnector,
  createBackendConnector
} from "@crudlio/crudl-connectors-base";
import {
  crudToHttp,
  url,
  transformData
} from "@crudlio/crudl-connectors-base/lib/middleware";
import restErrors from "../rest/errors";

export const dummy = config => {
  return createFrontendConnector({
    create: () => {
      return axios.get("foo");
    }
  }).use(
    transformData("create", data => {
      return {
        info: { username: "dummy user" }
      };
    })
  );
};
