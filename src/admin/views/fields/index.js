import inflection from "inflection";
import { select } from "../../utils";
import { regex_url } from "../../validation";
import config from "../../config";
import Joi from "joi";
import { renderField } from "./render";
import { renderTemplate } from "../../utils";
import { getReferenceLabelForField } from "../../utils";
import DateTimeField from "../../fields/DateTimeField";
import NumberField from "../../fields/NumberField";
import FileField from "../../fields/FileField";
import moment from "moment";
import fetch from "node-fetch";

export const getListField = field => {
  let render = renderField(field);
  let sortable = typeof render === "string";
  let main = field.main;

  return {
    name: field.attribute,
    label: field.label || inflection.camelize(field.attribute),
    main: main,
    sortable: sortable,
    getValue: getValueFn(field),
    render: render
  };
};

const getValueFn = field => {
  return values => {
    const value = values[field.attribute];
    if (field.template) {
      let _values = Object.assign({}, values, { value: value });
      return renderTemplate(field.template, _values);
    }
    switch (field.type) {
      case "date":
        return moment(value).format("LL");
      case "datetime":
        return moment(value).format("LLL");
    }
    return value;
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
        field: NumberField,
        step: field.step || 1,
        denormalize: value => {
          if (field.type === "int") {
            return parseInt(value);
          } else {
            return parseFloat(value);
          }
        }
      };
      break;
    case "url":
      f = {
        field: "URL",
        link: field.link || false
      };
      break;
    case "file":
      f = {
        field: FileField,
        onSelect: (file, dataURL) => {
          let uploadURL = config.fileUploadURL;

          if (!uploadURL)
            throw new Error(`configuration fileUploadURL is missing`);

          return fetch(uploadURL, {
            method: "POST",
            body: file
          })
            .then(res => res.json())
            .then(json => {
              return json.url;
            })
            .then(url => {
              return url;
            });
        }
      };
      break;
    case "date":
    case "datetime":
      f = {
        field: DateTimeField,
        type: field.type,
        normalize: value => {
          if (!value) return null;
          let m = moment(value);
          if (!m.isValid()) return null;
          // should display warning when displaying dates in different timezone!
          if (field.type === "date") return m.format("YYYY-MM-DD");
          return m.format("YYYY-MM-DDTHH:mm:ss");
        },
        denormalize: value => {
          if (!value) return null;
          let m = moment(value);
          if (!m.isValid()) return null;
          return m.format();
        }
      };
      break;
    case "time":
      f = {
        field: DateTimeField,
        type: field.type
      };
      break;
    case "text":
      f = {
        field: "Textarea"
      };
      break;
    default:
      f = {
        field: inflection.camelize(type),
        normalize: value => {
          if (typeof value === "undefined" || !value) {
            return value;
          }
          return value + "";
        },
        denormalize: value => {
          if (typeof value === "undefined" || !value) {
            return value;
          }
          return value + "";
        }
      };
  }

  f = Object.assign({}, f, {
    name: field.attribute,
    label: field.label || inflection.camelize(field.attribute),
    required: field.required,
    hidden: field.hidden,
    disabled: field.disabled,
    readOnly: field.readonly,
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
        schema = Joi.alternatives().try(Joi.string().allow(null), Joi.number());
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
