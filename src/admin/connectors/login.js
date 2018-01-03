import { password, dummy } from "./login/index";

export const login = config => {
  switch (config.grantType) {
    case "password":
      return password(config);
    case "dummy":
      return dummy(config);
  }
};
