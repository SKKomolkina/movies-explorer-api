const { isURL } = require('validator');
const BadRequestError = require('./Errors/BadRequestError');

module.exports = (value) => {
  const result = isURL(value, { require_protocol: true });
  if (result) {
    return value;
  }
  throw new BadRequestError('Введена некорректная ссылка!');
};
