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
      let args = {};
      args.sort = "[$sort]";
      args.filter = "[$filter]";

      let items = new Query("items");
      items.find("id", ...transformedFields);

      req.data = generateRequestData(
        queryName,
        args,
        [items, "count"],
        `query($sort:[${inflection.camelize(
          inflection.singularize(entity)
        )}SortType!],$filter:${inflection.camelize(
          inflection.singularize(entity)
        )}FilterType)`
      );

      req.data.query = req.data.query
        .replace('"[$sort]"', "$sort")
        .replace('"[$filter]"', "$filter");

      let sorting = req.sorting.map(
        s => s.sortKey.toUpperCase() + (s.sorted == "descending" ? "_DESC" : "")
      );

      req.data.variables = { sort: sorting, filter: req.filters };
    }

    return req;
  };
}

function modifyCreateRequest(entity, fields) {
  return req => {
    let id = req.params.length >= 0 && parseInt(req.params[0]);

    let queryName = `create${inflection.camelize(
      inflection.singularize(entity)
    )}`;
    let inputData = req.data;
    req.data = generateRequestData(
      queryName,
      { input: "[$input]" },
      ["id", ...fields.map(x => x.attribute)],
      `mutation($input:${inflection.camelize(
        inflection.singularize(entity)
      )}CreateInputType!)`
    );
    req.queryName = queryName;

    req.data.query = req.data.query.replace('"[$input]"', "$input");
    req.data.variables = { input: inputData };

    return req;
  };
}

function modifyUpdateRequest(entity, fields) {
  return req => {
    let id = req.params.length >= 0 && parseInt(req.params[0]);

    let inputData = Object.assign({}, req.data);
    delete inputData.id;
    let queryName = `update${inflection.camelize(entity)}`;
    req.data = generateRequestData(
      queryName,
      { id, input: "[$input]" },
      ["id", ...fields.map(x => x.attribute)],
      `mutation($input:${inflection.camelize(
        inflection.singularize(entity)
      )}UpdateInputType!)`
    );
    req.queryName = queryName;
    req.data.query = req.data.query.replace('"[$input]"', "$input");
    req.data.variables = { input: inputData };

    return req;
  };
}

function modifyDeleteRequest(entity, fields) {
  return req => {
    let id = req.params.length >= 0 && parseInt(req.params[0]);

    let queryName = `delete${inflection.camelize(entity)}`;
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
