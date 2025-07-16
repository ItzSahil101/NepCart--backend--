// controllers/validateUser.js
const Joi = require("joi");

const schema = Joi.object({
  userName: Joi.string().required(),
  number: Joi.string().required(),
  password: Joi.string().required(),
  location: Joi.string().required(),
});

function validateUser(data) {
  return schema.validate(data);
}

module.exports = validateUser;
