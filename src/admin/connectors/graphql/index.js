import { singularize } from "inflection";

import {
  createFrontendConnector,
  createBackendConnector
} from "@crudlio/crudl-connectors-base";
import { crudToHttp, url } from "@crudlio/crudl-connectors-base/lib/middleware";

// import errors from "./errors";
import numberedPagination from "./pagination";
import { buildQuery } from "./query";
import { transformListResult, transformDetailResult } from "./transforms";
// import buildQuery from "./buildQuery";
import { transformReference } from "../utils";
import errors from "./errors";

function createRestConnector(baseURL, entity, fields) {
  return createFrontendConnector(createBackendConnector({ baseURL }))
    .use(buildQuery(entity, fields))
    .use(
      crudToHttp({
        create: "post",
        read: "post",
        update: "post",
        delete: "post"
      })
    )
    .use(url("/"))
    .use(errors);
}

export const list = (baseUrl, entity, fields, limit) =>
  createRestConnector(baseUrl, entity, fields, limit)
    .use(transformListResult(entity, fields))
    .use(numberedPagination)
    .use(transformReference(fields))(null, limit);

export const detail = (baseUrl, entity, fields, id) => {
  return createRestConnector(baseUrl, entity, fields).use(
    transformDetailResult(entity, fields)
  )(id);
};

export default (baseUrl, entity, defaultFields) => {
  return {
    list: (fields, limit) => {
      return list(baseUrl, entity, fields || defaultFields, limit);
    },
    detail: (id, fields) => {
      return detail(baseUrl, singularize(entity), fields || defaultFields, id);
    }
  };
};
