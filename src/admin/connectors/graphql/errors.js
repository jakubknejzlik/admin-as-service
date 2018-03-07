/** middleware to transfrom express errors to crudl errors */
export default function crudlErrors(next) {
  function transformErrors(error) {
    if (error !== null && typeof error === "object") {
      if (error.__all__) {
        error._error = error.__all__;
      }
    }
    return error;
  }

  function processGraphQLResponse(response) {
    let errors = response.data.errors;
    if (errors && errors.length > 0) {
      let error = {
        validationError: true,
        permissionError: false,
        errors: { _error: errors[0].message }
      };
      throw error;
    }
    return response;
  }

  function processError(response) {
    if (!response) {
      throw { message: "unknown error" };
    }
    switch (response.status) {
      case 400:
        throw { validationError: true, errors: transformErrors(response.data) };
      case 401:
        throw { authorizationError: true };
      case 403:
        throw { permissionError: true };
      default:
        throw response;
    }
  }

  return {
    create: req =>
      next
        .create(req)
        .then(processGraphQLResponse)
        .catch(processError),
    read: req =>
      next
        .read(req)
        .then(processGraphQLResponse)
        .catch(processError),
    update: req =>
      next
        .update(req)
        .then(processGraphQLResponse)
        .catch(processError),
    delete: req =>
      next
        .delete(req)
        .then(processGraphQLResponse)
        .catch(processError)
  };
}
