import inflection from "inflection";
import { select } from "../utils";
import { regex_url } from "../validation";
import config from "../config";
import Handlebars from "handlebars";
import Joi from "joi";
import { getField } from "./fields";

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

  // changeView.tabs = [
  //   {
  //     title: "Links",
  //     actions: {
  //       list: req => Promise.resolve([]), // Filter results by the current blog entry
  //       add: req => Promise.resolve({}),
  //       save: req => Promise.resolve({}),
  //       delete: req => Promise.resolve({})
  //     },
  //     getItemTitle: data => `${data.url} (${data.title})`, // Define the item title (Optional)
  //     fields: [
  //       {
  //         name: "url",
  //         label: "URL",
  //         field: "URL",
  //         link: true
  //       },
  //       {
  //         name: "title",
  //         label: "Title",
  //         field: "String"
  //       },
  //       {
  //         name: "id", // Needed in order to make update and delete requests
  //         hidden: true // Don't show this one
  //       },
  //       {
  //         name: "entry", // The foreign key field
  //         hidden: true, // Don't show this one
  //         initialValue: () => crudl.context("id") // initialValue is used when adding a new link
  //       }
  //     ],
  //     validate(data) {
  //       // Check the data
  //       return data;
  //     },
  //     normalize(data) {
  //       // Prepare data for the frontend
  //       return data;
  //     },
  //     denormalize(data) {
  //       // Prepare data for the backend
  //       return data;
  //     }
  //   }
  // ];

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
