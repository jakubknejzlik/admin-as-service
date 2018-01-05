import inflection from "inflection";
import { select } from "../../utils";
import { regex_url } from "../../validation";
import config from "../../config";
import Joi from "joi";
import { renderField } from "./render";
import { getReferenceLabelForField } from "../../utils";
import DateTimeField from "../../fields/DateTimeField";

export const getListField = field => {
  let render = renderField(field);
  let sortable = typeof render === "string";
  let main = field.main;

  return {
    name: field.attribute,
    label: field.label || inflection.camelize(field.attribute),
    main: main,
    sortable: sortable,
    render: render
  };
};

export const getField = field => {
  let type = field.type || "string";
  let f = null;
  switch (type) {
    case "boolean":
      f = {
        field: "Checkbox"
      };
      break;
    case "choice":
      f = getChoiceField(field);
      break;
    case "choices":
      f = getChoicesField(field);
      break;
    case "reference":
      f = getReferenceField(field);
      break;
    case "float":
    case "int":
    case "decimal":
      f = {
        field: "String"
      };
      break;
    case "url":
      f = {
        field: "URL",
        link: field.link || false
      };
      break;
    case "date":
      f = {
        field: DateTimeField,
        getTime: date => {
          let T = date.indexOf("T");
          return date.slice(T + 1, T + 6);
        },
        getDate: date => {
          let T = date.indexOf("T");
          return date.slice(0, T);
        }
      };
      break;
    case "text":
      f = {
        field: "Textarea"
      };
      break;
    default:
      f = {
        field: inflection.camelize(type)
      };
  }

  f = Object.assign({}, f, {
    name: field.attribute,
    label: field.label || inflection.camelize(field.attribute),
    required: field.required,
    helpText: field.helpText,
    validate: getValidationForField(field)
  });
  return f;
};

const getChoiceField = field => {
  return {
    // getValue: select("category._id"),
    getValue: select(field.attribute),
    // field: "AutocompleteMultiple",
    field: "Select",
    options: field.options || []
    // required: false,
    // showAll: false,
    // helpText: "Select roles",
    // lazy: () => {
    //   console.log("lazy");
    //   return roles
    //     .list()
    //     .read(crudl.req())
    //     .then(result =>
    //       result.map(item => {
    //         return { value: item.id, label: item.name };
    //       })
    //     )
    //     .then(list => {
    //       return { options: list };
    //     });
    // }
  };
};

const getChoicesField = field => {
  return {
    // getValue: select("category._id"),
    getValue: select(field.attribute),
    // field: "AutocompleteMultiple",
    field: "SelectMultiple",
    options: field.options || []
    // required: false,
    // showAll: false,
    // helpText: "Select roles",
    // lazy: () => {
    //   console.log("lazy");
    //   return roles
    //     .list()
    //     .read(crudl.req())
    //     .then(result =>
    //       result.map(item => {
    //         return { value: item.id, label: item.name };
    //       })
    //     )
    //     .then(list => {
    //       return { options: list };
    //     });
    // }
  };
};

const getReferenceField = field => {
  let entity = config.getEntity(field.entity);
  let connector = entity.connector;
  return {
    getValue: select(field.attribute),
    field: field.toMany ? "AutocompleteMultiple" : "Autocomplete",
    showAll: true,
    actions: {
      search: req => {
        req = req.filter("q", req.data.query);
        return connector
          .list()
          .read(req)
          .then(result =>
            result.map(item => {
              let label = getReferenceLabelForField(item, field);
              return { value: item.id, label: label };
            })
          );
      },
      select: req => {
        return Promise.all(
          req.data.selection.map(item => {
            return connector
              .detail(item.value)
              .read(crudl.req())
              .then(item => {
                let label = getReferenceLabelForField(item, field);
                return { value: item.id, label: label };
              });
          })
        );
      }
      // Promise.all(
      //   req.data.selection.map(item =>
      //     tags(item.value)
      //       .read(crudl.req())
      //       .then(tag => ({ value: tag._id, label: tag.name }))
      //   )
      // )
    }
  };
};

const getValidationForField = field => (value, allValues) => {
  if (value === "") {
    value = undefined;
  }

  if (!field.schema) {
    let schema = null;
    switch (field.type) {
      case "boolean":
        schema = Joi.bool();
        break;
      case "float":
      case "int":
      case "reference":
        if (field.toMany) schema = Joi.array();
        else schema = Joi.number().allow("", null);
        break;
      case "choice":
        schema = Joi.alternatives().try(Joi.string(), Joi.number());
        break;
      case "choices":
        schema = Joi.array();
        break;
      case "email":
      case "url":
      default:
        schema = Joi.string().allow("", null);
    }

    if (field.type === "email") {
      schema = schema.email();
    }
    if (field.type === "url") {
      schema = schema.regex(regex_url, "URL");
    }
    if (field.required) {
      schema = schema.required();
    }
    field.schema = schema;
  }

  let result = Joi.validate(value, field.schema);
  return result.error && result.error.message;
};
