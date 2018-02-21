import {
  createFrontendConnector,
  createBackendConnector
} from "@crudlio/crudl-connectors-base";
import {
  crudToHttp,
  url,
  transformData
} from "@crudlio/crudl-connectors-base/lib/middleware";

import errors from "./errors";
import numberedPagination from "./pagination";
import buildQuery from "./buildQuery";
import { transformReference } from "../utils";

function createRestConnector(baseURL, urlPath, fields, limit) {
  return createFrontendConnector(createBackendConnector({ baseURL }))
    .use(buildQuery(fields, limit))
    .use(crudToHttp())
    .use(url(urlPath))
    .use(errors);
}

export const list = (baseUrl, collection, fields, limit) =>
  createRestConnector(baseUrl, ":collection/", fields, limit)
    .use(numberedPagination)
    .use(transformReference(fields))(collection);

export const detail = (baseUrl, collection, id) => {
  return createRestConnector(baseUrl, ":collection/:id/")(collection, id);
};

export default (baseUrl, urlPath, defaultFields) => {
  return {
    list: (fields, limit) =>
      list(baseUrl, urlPath, fields || defaultFields, limit),
    detail: id => detail(baseUrl, urlPath, id)
  };
};
