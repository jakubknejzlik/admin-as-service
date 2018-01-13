import React from 'react';

import { renderTemplate } from '../utils';
import { getField, getListField } from './fields';

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
  let actionField = getActionField(entity);
  if (actionField) listView.fields.push(actionField);
  listView.filters = getFilters(entity);

  return listView;
};

const getFields = entity => {
  let fields = (entity.list && entity.list.fields) || entity.fields;

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

  let values = Object.assign({}, field, { auth: crudl.auth });
  url = url.replace(/{{[^}]+}}/g, x => {
    return renderTemplate(x, values);
  });

  return (
    <a key={i} href={url} target={action.target}>
      {action.title} {field.id}
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
