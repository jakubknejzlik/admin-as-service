import config from "../config";
import { getReferenceLabelForField } from "../utils";

export function getSearchFields(fields) {
  return fields
    .filter(f => !f.type || f.type === "string")
    .map(f => f.attribute)
    .join(",");
}

// load field with type reference and fill data with results
export const loadDataForFields = (data, fields) => {
  let referenceFields = fields.filter(f => f.type === "reference");
  return Promise.all(referenceFields.map(f => loadDataForField(data, f))).then(
    () => data
  );
};
const loadDataForField = (data, field) => {
  let values = {};
  let entity = config.getEntity(field.entity);

  for (let row of data) {
    let value = row[field.attribute];
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
      for (let row of data) {
        let value = row[field.attribute];
        if (field.toMany) row[field.attribute] = value.map(v => values[v]);
        else row[field.attribute] = values[value];
      }
    })
    .then(() => data);
};
