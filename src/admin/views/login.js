import { login as loginConnector } from "../connectors";

//-------------------------------------------------------------------
var login = config => {
  let result = {
    actions: {
      login: loginConnector(config).create
    }
  };

  let helpText = fieldName => {
    return config.grantType === "dummy"
      ? `You can use any ${fieldName} for dummy auth`
      : "";
  };

  result.fields = [
    {
      name: "username",
      label: "Username",
      field: "Text",
      helpText: helpText("Username")
    },
    {
      name: "password",
      label: "Password",
      field: "Password",
      helpText: helpText("Password")
    }
  ];

  return result;
};

//-------------------------------------------------------------------
// var logout = {
//   path: "aaa",
//   title: "Logout",
//   id: "logout"
//   // actions: {
//   //   logout: loginConnector.create
//   // }
// };

//-------------------------------------------------------------------
module.exports = {
  login,
  logout: undefined
};
