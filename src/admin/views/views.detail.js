import { getEntity } from '../config';
import { renderTemplate } from '../utils';
import { getField } from './fields';

export const createAddView = entity => {
  let connector = entity.connector.list();
  let title = entity.create && entity.create.title;
  if (!title) {
    let name = entity.name || entity.path;
    title = `${name} Create`;
  }

  let createView = {
    path: `${entity.path}/new`,
    title: title,
    actions: {
      add: function(req) {
        return connector.create(req);
      }
    }
  };

  createView.fieldsets = getFieldsets(entity, "create");

  return createView;
};

export const createChangeView = entity => {
  let connector = entity.connector;
  let title = entity.edit && entity.edit.title;
  if (!title) {
    let name = entity.name || entity.path;
    title = `${name} Detail`;
  }

  let changeView = {
    path: `${entity.path}/:id`,
    title: title,
    actions: {
      get: function(req) {
        return connector.detail(crudl.path.id).read(req);
      },
      save: function(req) {
        return connector.detail(crudl.path.id).update(req);
      },
      delete: function(req) {
        return connector.detail(crudl.path.id).delete(req);
      }
    },
    validate(data) {
      // Check the data
      // console.log("??", data);
      return {};
      // return { email: "invalid email" };
      // return data;
    }
  };

  changeView.fieldsets = getFieldsets(entity, "edit");

  changeView.tabs = getTabs(entity);

  return changeView;
};

const getFieldsets = (entity, type) => {
  let fieldsets = (entity[type] && entity[type].fieldsets) || entity.fieldsets;
  if (!fieldsets) {
    let fields = (entity[type] && entity[type].fields) || entity.fields;
    fieldsets = [{ fields }];
  }
  return fieldsets.map(fieldset =>
    Object.assign({}, fieldset, {
      fields: fieldset.fields.map(field => getField(field))
    })
  );
};

const getTabs = entity => {
  let tabs = (entity.edit && entity.edit.tabs) || [];
  return tabs.map(getTab);
};

const getTab = tab => {
  let entity = getEntity(tab.reference.entity);
  let listConnector = entity.connector.list();

  let fields = tab.fields.map(field => getField(field));
  fields.push({ name: "id", hidden: true });
  fields.push({
    name: tab.reference.attribute,
    hidden: true,
    getValue: () => crudl.path.id
  });

  return {
    title: tab.title,
    actions: {
      list: req =>
        listConnector.read(req.filter(tab.reference.attribute, crudl.path.id)),
      add: req => listConnector.create(req),
      save: req => entity.connector.detail(req.data.id).update(req),
      delete: req => entity.connector.detail(req.data.id).delete(req)
    },
    getItemTitle: data => renderTemplate(tab.itemTitle, data), // Define the item title (Optional)
    fields: fields
  };
};
