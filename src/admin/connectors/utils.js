import config from "../config";
import { getReferenceLabelForField } from "../utils";

export function getSearchFields(fields) {
  return fields
    .filter(f => !f.type || f.type === "string")
    .map(f => f.attribute)
    .join(",");
}

// load field with type reference and fill data with results
export const transformReference = fields => next => {
  return {
    read: req =>
      next.read(req).then(res => {
        if (!fields) return res;
        return loadDataForFields(res.data, fields).then(data => {
          res.data = data;
          return res;
        });
      })
  };
};

const loadDataForFields = (data, fields) => {
  let referenceFields = fields.filter(f => f.type === "reference");
  let pagination = data.pagination;
  let referenceData = data.map(a => Object.assign({}, a));
  return Promise.all(
    referenceFields.map(f => loadDataForField(data, f, referenceData))
  ).then(() => {
    data.pagination = pagination;
    return data;
  });
};
const loadDataForField = (data, field, referenceData) => {
  let values = {};
  let entity = config.getEntity(field.entity);
  const foreignKey = field.foreignKey || field.attribute;

  for (let row of data) {
    let value = row[foreignKey];
    if (!value) continue;
    if (field.toMany) value.map(v => (values[v] = v));
    else values[value] = value;
  }

  let promises = Object.keys(values).map(valueKey => {
    return entity.connector
      .detail(valueKey)
      .read(crudl.req())
      .then(finalValue => {
        let value = getReferenceLabelForField(finalValue, field);
        values[valueKey] = value;
      });
  });

  return Promise.all(promises)
    .then(() => {
      for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
        let row = data[rowIndex];
        let referenceRow = referenceData[rowIndex];
        let value = referenceRow[foreignKey];
        console.log(referenceRow, "=>", foreignKey, value, values);
        if (field.toMany) row[field.attribute] = value.map(v => values[v]);
        else row[field.attribute] = values[value];
      }
    })
    .then(() => data);
};
