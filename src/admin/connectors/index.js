import rest from "./rest";
import jsonServer from "./json-server";
import graphql from "./graphql";

export { login } from "./login";

const types = {
  rest,
  graphql,
  "json-server": jsonServer
};

export const createConnectorFactory = (type, baseUrl) => {
  type = type || "rest";
  const create = types[type];

  if (!create) {
    throw new Error(
      `unknown api type ${type} (supported: ${Object.keys(types)})`
    );
  }

  return {
    connectorForEntity: entity => {
      return create(baseUrl, entity.path, entity.listFields);
    }
  };
};
