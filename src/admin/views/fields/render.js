export const renderField = (field, connectorFactory) => {
  let result = "string";
  if (field.type === "boolean") {
    result = "boolean";
  }
  if (field.type === "choice" || field.type === "choices") {
    result = renderChoicesField(field);
  }

  if (field.type === "reference") {
    result = value => "reference";
  }

  if (["float", "int"].indexOf(field.type) !== -1) {
    result = "number";
  }
  return result;
};

export const renderChoicesField = field => {
  return value => {
    if (!value) return null;
    if (!Array.isArray(value)) value = [value];
    let filtered = field.options
      .filter(option => value.indexOf(option.value) !== -1)
      .map(x => x.label);
    return filtered.join(", ");
  };
};
