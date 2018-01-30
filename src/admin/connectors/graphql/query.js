import { getReferenceLabelForField } from "../../utils";
// use local version until: https://github.com/codemeasandwich/graphql-query-builder/pull/9
import Query from "./graphql-query";
import inflection from "inflection";

function generateRequestData(queryName, args, fields, type = "query") {
  args = JSON.parse(JSON.stringify(args));
  let q = new Query(queryName, args);

  q.find(...fields);

  return {
    query: `${type}{${q.toString()}}`
  };
}

function modifyReadRequest(entity, fields) {
  return req => {
    let id = (req.params.length >= 0 && parseInt(req.params[0])) || null;
    let queryName = entity;

    req.queryName = queryName;

    let transformedFields = fields.map(field => field.attribute);

    if (id) {
      req.data = generateRequestData(queryName, { id }, [
        "id",
        ...transformedFields
      ]);
    } else {
      let items = new Query("items");
      items.find("id", ...transformedFields);
      req.data = generateRequestData(queryName, {}, [items, "count"]);
    }

    return req;
  };
}

function modifyCreateRequest(entity, fields) {
  return req => {
    let id = req.params.length >= 0 && parseInt(req.params[0]);

    let queryName = `create${inflection.capitalize(
      inflection.singularize(entity)
    )}`;
    req.data = generateRequestData(
      queryName,
      { input: req.data },
      ["id", ...fields.map(x => x.attribute)],
      "mutation"
    );
    req.queryName = queryName;

    return req;
  };
}

function modifyUpdateRequest(entity, fields) {
  return req => {
    let id = req.params.length >= 0 && parseInt(req.params[0]);

    console.log("data:", req.data);

    let queryName = `update${inflection.capitalize(entity)}`;
    req.data = generateRequestData(
      queryName,
      { id, input: req.data },
      ["id", ...fields.map(x => x.attribute)],
      "mutation"
    );
    req.queryName = queryName;

    return req;
  };
}

function modifyDeleteRequest(entity, fields) {
  return req => {
    let id = req.params.length >= 0 && parseInt(req.params[0]);

    let queryName = `delete${inflection.capitalize(entity)}`;
    req.data = generateRequestData(
      queryName,
      { id },
      ["id", ...fields.map(x => x.attribute)],
      "mutation"
    );
    req.queryName = queryName;

    return req;
  };
}

export function buildQuery(entity, fields) {
  return next => ({
    create: req => {
      req = modifyCreateRequest(entity, fields)(req);
      return next.create(req);
    },
    read: req => {
      req = modifyReadRequest(entity, fields)(req);
      return next.read(req);
    },
    update: req => {
      req = modifyUpdateRequest(entity, fields)(req);
      return next.update(req);
    },
    delete: req => {
      req = modifyDeleteRequest(entity, fields)(req);
      return next.delete(req);
    }
  });
}
