const serverError = (responseObject) => {
  return responseObject.status(500).send({
    message: 'Internal server error. Please try again later',
    success: false,
  });
};

const userNotFound = (responseObject) => {
  return responseObject
    .status(404)
    .send({ message: 'User not found', success: false });
};

module.exports = { serverError, userNotFound };
