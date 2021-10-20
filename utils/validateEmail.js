const { isEmail } = require('validator');
const BadRequestError = require('./Errors/BadRequestError');

module.exports = (value) => {
  const result = isEmail(value);
  if (result) {
    return value;
  }
  throw new BadRequestError('Введена некорректная почта.');
};
