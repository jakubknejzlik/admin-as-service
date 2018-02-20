import toPath from "lodash/toPath";
import get from "lodash/get";
import _ from "underscore";
import moment from "moment";
import numeral from "numeral";

import config from "./config";

// load a locale
numeral.register("locale", "custom", {
  delimiters: {
    thousands:
      (config.numeral &&
        config.numeral.delimiters &&
        config.numeral.delimiters.thousands) ||
      ",",
    decimal:
      (config.numeral &&
        config.numeral.delimiters &&
        config.numeral.delimiters.decimal) ||
      "."
  },
  abbreviations: {
    thousand: "k",
    million: "m",
    billion: "b",
    trillion: "t"
  },
  // ordinal: function(number) {
  //   return number === 1 ? "er" : "ème";
  // },
  currency: {
    symbol:
      (config.numeral &&
        config.numeral.currency &&
        config.numeral.currency.symbol) ||
      "$"
  }
});

numeral.locale("custom");
_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

export const getReferenceLabelForField = (ref, field) => {
  if (field.template) {
    return renderTemplate(field.template, ref);
  }
  return ref[field.targetField];
};

export const renderTemplate = (template, values) => {
  let temp = _.template(template);
  values = Object.assign({}, values, { moment, numeral });
  let v = temp(values);
  return v;
};

/**
 * Works like lodash.get() with an extra feature: '[*]' selects
 * the complete array. For example:
 *
 *      let object = { name: 'Abc', tags: [ {id: 1, name: 'javascript'}, {id: 2, name: 'select'} ]}
 *      let names = select(object, 'tags[*].name')
 *      console.log(names)
 *      > ['javascript', 'select']
 *
 */
export function select(pathSpec, defaultValue) {
  const _select = (data, pathSpec, defaultValue) => {
    if (!data || !pathSpec) {
      return defaultValue;
    }
    const path = toPath(pathSpec);
    const pos = path.indexOf("*");
    if (pos >= 0) {
      // Break the path at '*' and do select() recursively on
      // every element of the first path part
      return get(data, path.slice(0, pos)).map(item =>
        _select(item, path.slice(pos + 1), defaultValue)
      );
    }
    return get(data, path, defaultValue);
  };
  return data => _select(data, pathSpec, defaultValue);
}
