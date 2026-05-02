import { badRequestResponse } from "../utils/api-response.js";
import {
  registerSchema,
  loginSchema,
  validateUpdateProfileSchema,
} from "../validations/auth.validate.js";

export const validateRegister = (req, res, next) => {
  const { error } = registerSchema.validate(req.body);

  if (error) {
    return badRequestResponse(res, error.details[0].message);
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);

  if (error) {
    return badRequestResponse(res, error.details[0].message);
  }

  next();
};

export const validateUpdateProfile = (req, res, next) => {
  const { error } = validateUpdateProfileSchema.validate(req.body);

  if (error) {
    return badRequestResponse(res, error.details[0].message);
  }

  next();
};
