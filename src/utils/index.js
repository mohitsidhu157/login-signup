const joi = require('joi');

const loginSchema = joi.object({
  password: joi.string().required(),
  email: joi.string().required().email(),
});

const registerSchema = joi.object({
  name: joi.string().min(3).max(30).required(),
  password: joi.string().min(6).max(30).required(),
  email: joi.string().required().email(),
});

const updateUserSchema = joi.object({
  name: joi.string().min(3).max(30),
  email: joi.string().email(),
});

module.exports = { loginSchema, registerSchema, updateUserSchema };
