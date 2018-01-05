import inflection from "inflection";
import { getListField, getField } from "./fields";

export const createListView = entity => {
  let connector = entity.connector.list();

  let title = (entity.list && entity.list.title) || entity.name || entity.path;

  let listView = {
    path: entity.path,
    title: title,
    actions: {
      list: function(req) {
        return connector.read(req);
      }
    }
  };

  listView.fields = getFields(entity);
  listView.filters = getFilters(entity);

  return listView;
};

const getFields = entity => {
  let fields = (entity.list && entity.list.fields) || entity.fields;

  return fields.map(getListField);
};

const getFilters = entity => {
  let filters = entity.list && entity.list.filters;

  if (!filters) return undefined;

  let fields = filters.fields.map(field => getField(field));
  return {
    fields: fields
  };
};
