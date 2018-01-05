import {
  createFrontendConnector,
  createBackendConnector
} from "@crudlio/crudl-connectors-base";
import {
  crudToHttp,
  url,
  transformData
} from "@crudlio/crudl-connectors-base/lib/middleware";
import config from "../../config";
import { getReferenceLabelForField } from "../../utils";

import errors from "./errors";
import numberedPagination from "./pagination";
import buildQuery from "./buildQuery";
import { transformReference } from "../utils";

function createRestConnector(baseURL, urlPath, fields) {
  return createFrontendConnector(createBackendConnector({ baseURL }))
    .use(buildQuery(fields))
    .use(crudToHttp())
    .use(url(urlPath))
    .use(errors);
}

export const list = (baseUrl, collection, fields) =>
  createRestConnector(baseUrl, ":collection/", fields)
    .use(numberedPagination)
    .use(transformReference(fields))(collection);

export const detail = (baseUrl, collection, id) => {
  return createRestConnector(baseUrl, ":collection/:id/")(collection, id);
};

export default (baseUrl, urlPath, fields) => {
  return {
    list: () => list(baseUrl, urlPath, fields),
    detail: id => detail(baseUrl, urlPath, id)
  };
};
