import inflection from "inflection";
import { getListField, getField } from "./fields";

export const createListView = (entity, connectorFactory) => {
  let connector = connectorFactory.connectorForEntity(entity).list();

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

  listView.fields = getFields(entity, connectorFactory);
  listView.filters = getFilters(entity, connectorFactory);

  return listView;
};

const getFields = (entity, connectorFactory) => {
  let fields = (entity.list && entity.list.fields) || entity.fields;

  return fields.map(getListField, connectorFactory);
};

const getFilters = (entity, connectorFactory) => {
  let filters = entity.list && entity.list.filters;

  if (!filters) return undefined;

  let fields = filters.fields.map(field => getField(field, connectorFactory));
  return {
    fields: fields
  };
};
