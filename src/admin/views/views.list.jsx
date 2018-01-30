import React from "react";

import { renderTemplate } from "../utils";
import { getField, getListField } from "./fields";

export const createListView = entity => {
  let listConnector = entity.connector.list();

  let title = (entity.list && entity.list.title) || entity.name || entity.path;

  let listView = {
    path: entity.path,
    title: title,
    actions: {
      list: function(req) {
        return listConnector.read(req);
      }
    }
  };

  listView.fields = getFields(entity);
  let actionField = getActionField(entity);
  if (actionField) listView.fields.push(actionField);
  listView.filters = getFilters(entity);

  listView.bulkActions = {
    delete: {
      description: "Delete",
      modalConfirm: {
        message:
          "All the selected items will be deleted. This action cannot be reversed!",
        modalType: "modal-delete",
        labelConfirm: "Delete All"
      },
      action: selection =>
        Promise.all(
          selection.map(item =>
            entity.connector.detail(item.id).delete(crudl.req())
          )
        ).then(() =>
          crudl.successMessage(`All items (${selection.length}) were deleted`)
        )
    }
  };

  return listView;
};

const getFields = entity => {
  let fields = (entity.list && entity.list.fields) || entity.fields;

  fields = fields.filter(x => !x.hidden);

  return fields.map(getListField);
};

const getActionField = entity => {
  let listActions = entity.list && entity.list.listActions;
  if (!listActions) return null;
  let field = {
    name: "_actions",
    label: " ",
    getValue: x => {
      field.values = x;
      return x;
    },
    render: () => {
      let buttons = listActions.map((action, i) =>
        getButtonForAction(field, action, i)
      );
      return buttons;
    }
  };
  return field;
};

const getButtonForAction = (field, action, i) => {
  let url = action.url;
  let title = action.title;

  let values = Object.assign({}, field, { auth: crudl.auth });

  url = renderTemplate(url, values);
  title = renderTemplate(title, values);

  return (
    <a key={i} href={url} target={action.target}>
      {title}
    </a>
  );
};

const getFilters = entity => {
  let filters = entity.list && entity.list.filters;

  if (!filters) return undefined;

  let fields = filters.fields.map(field => getField(field));
  return {
    fields: fields
  };
};
