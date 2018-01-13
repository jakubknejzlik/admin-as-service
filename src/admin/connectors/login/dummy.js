import { createFrontendConnector } from '@crudlio/crudl-connectors-base';
import { transformData } from '@crudlio/crudl-connectors-base/lib/middleware';
import axios from 'axios';

export const dummy = config => {
  return createFrontendConnector({
    create: () => {
      return axios.get("foo");
    }
  }).use(
    transformData("create", data => {
      return {
        info: { access_token: "dummy_token", username: "dummy user" }
      };
    })
  );
};
