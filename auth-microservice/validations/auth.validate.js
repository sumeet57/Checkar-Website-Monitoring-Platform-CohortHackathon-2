import Joi from "joi";

export const registerSchema = Joi.object({
  firstName: Joi.string().min(1).max(50).required().messages({
    "string.base": "First name should be a string",
    "string.empty": "First name is required",
    "any.required": "First name is required",
  }),
  lastName: Joi.string().min(1).max(50).required().messages({
    "string.base": "Last name should be a string",
    "string.empty": "Last name is required",
    "any.required": "Last name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.base": "Email should be a string",
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.base": "Password should be a string",
    "string.empty": "Password is required",
    "string.min": "Password should be at least 6 characters long",
    "any.required": "Password is required",
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.base": "Email should be a string",
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.base": "Password should be a string",
    "string.empty": "Password is required",
    "string.min": "Password should be at least 6 characters long",
    "any.required": "Password is required",
  }),
});

export const validateUpdateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(30).messages({
    "string.base": "First name should be a string",
    "string.empty": "First name cannot be empty",
    "string.min": "First name should be at least 2 characters long",
    "string.max": "First name should not exceed 30 characters",
  }),
  lastName: Joi.string().min(2).max(30).messages({
    "string.base": "Last name should be a string",
    "string.empty": "Last name cannot be empty",
    "string.min": "Last name should be at least 2 characters long",
    "string.max": "Last name should not exceed 30 characters",
  }),
});
