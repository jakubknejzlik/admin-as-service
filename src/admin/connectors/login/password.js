import { createBackendConnector, createFrontendConnector } from '@crudlio/crudl-connectors-base';
import { crudToHttp, transformData, url } from '@crudlio/crudl-connectors-base/lib/middleware';
import jwt from 'jsonwebtoken';

import restErrors from '../rest/errors';

export const password = config =>
  createFrontendConnector(createBackendConnector())
    .use(url(config.authorizeUrl))
    .use(crudToHttp())
    .use(next => {
      return {
        create: req => {
          req.headers["content-type"] =
            "application/x-www-form-urlencoded;charset=utf-8";

          req.data.grant_type = config.grantType;
          req.data.client_id = config.clientId;
          req.data.client_secret = config.clientSecret;
          req.data.scope = config.scope;
          req.data = serialize(req.data);
          return next.create(req);
        }
      };
    })
    .use(restErrors) // rest-api errors
    .use(
      transformData("create", data => {
        var userInfo = jwt.decode(data.access_token);
        userInfo = userInfo.user || userInfo;
        userInfo.access_token = data.access_token;
        return {
          requestHeaders: {
            Authorization: `Bearer ${data.access_token}`
          },
          info: userInfo
        };
      })
    );

const serialize = function(obj, prefix) {
  var str = [],
    p;
  for (p in obj) {
    if (obj.hasOwnProperty(p)) {
      var k = prefix ? prefix + "[" + p + "]" : p,
        v = obj[p];
      str.push(
        v !== null && typeof v === "object"
          ? serialize(v, k)
          : encodeURIComponent(k) + "=" + encodeURIComponent(v)
      );
    }
  }
  return str.join("&");
};
