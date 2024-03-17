const wrapAsync = (asyncHandler) => {
  return (request, response) => {
    Promise.resolve(asyncHandler(request, response));
  };
};

const sendFailure = (errors, response, redirect) => {
  const content = { success: false, errors: errors };
  if (redirect !== undefined) {
    content['redirect'] = redirect;
  }
  response.send(JSON.stringify(content));
};

const sendSuccess = (data, response, redirect) => {
  const content = { success: true, data: data };
  if (redirect !== undefined) {
    content['redirect'] = redirect;
  }
  response.send(JSON.stringify(content));
}

const deepCopy = object => JSON.parse(JSON.stringify(object));

module.exports = {
  sendFailure,
  sendSuccess,
  wrapAsync,
  deepCopy,
};
