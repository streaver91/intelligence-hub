const wrapAsync = (asyncHandler) => {
  return (request, response) => {
    Promise.resolve(asyncHandler(request, response));
  };
};

const sendFailure = (errors, response, redirect_url) => {
  const content = { success: false, errors: errors };
  if (redirect_url !== undefined) {
    content['redirect'] = redirect_url;
  }
  response.send(JSON.stringify(content));
};

const sendSuccess = (data, response, redirect_url) => {
  const content = { success: true, data: data };
  if (redirect_url !== undefined) {
    content['redirect'] = redirect_url;
  }
  response.send(JSON.stringify(content));
}

module.exports = {
  sendFailure,
  sendSuccess,
  wrapAsync,
};
