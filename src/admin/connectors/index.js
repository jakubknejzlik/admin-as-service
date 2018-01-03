import rest from "./rest";
import jsonServer from "./json-server";

export { login } from "./login";

const types = {
  rest,
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

// export const createResourceConnector = (type, baseUrl, urlPath) => {
//   const create = types[type];

//   if (!create) {
//     throw new Error(
//       `unknown api type ${type} (supported: ${Object.keys(types)})`
//     );
//   }
//   return create(baseUrl, urlPath);
// };
