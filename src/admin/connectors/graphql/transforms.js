import { getReferenceLabelForField } from "../../utils";
import Query from "graphql-query-builder";

export function transformListResult(entity, fields) {
  // let itemMapper = mapItems(entity, fields);
  return next => ({
    create: req => {
      return next.create(req).then(res => {
        res.data = res.data.data[req.queryName];
        return res;
      });
    },
    read: req => {
      return next.read(req).then(res => {
        let count = res.data.data[req.queryName].count;
        res.data = res.data.data[req.queryName].items;
        res.data.count = count;
        return res;
      });
    },
    update: req => {
      return next.update(req);
    },
    delete: req => {
      return next.delete(req);
    }
  });
}

export function transformDetailResult(entity, fields) {
  // let itemMapper = mapItems(entity, fields);
  return next => ({
    create: req => {
      return next.create(req).then(res => {
        res.data = res.data.data[req.queryName];
        return res;
      });
    },
    read: req => {
      return next.read(req).then(res => {
        res.data = res.data.data[req.queryName];
        return res;
      });
    },
    update: req => {
      return next.update(req).then(res => {
        res.data = res.data.data[req.queryName];
        return res;
      });
    },
    delete: req => {
      return next.delete(req);
    }
  });
}

const mapItems = (entity, fields) => {
  return item => {
    for (let field of fields) {
      if (field.type == "reference") {
        if (field.toMany) {
          item[field.attribute] = item[field.attribute].map(item =>
            getReferenceLabelForField(item, field)
          );
        } else {
          item[field.attribute] = getReferenceLabelForField(
            item[field.attribute],
            field
          );
        }
      }
    }
    return item;
  };
};
