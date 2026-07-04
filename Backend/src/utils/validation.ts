import Joi from "joi";
import { badRequest } from "./http-error.js";

export const registerSchema = Joi.object({
  first_name: Joi.string().trim().min(1).max(50).required(),
  last_name: Joi.string().trim().min(1).max(50).required(),
  email: Joi.string().trim().email().max(100).required(),
  password: Joi.string().min(4).max(100).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(4).required(),
});

// Vacation body fields arrive as multipart strings, so we coerce numbers/dates.
const isoDate = Joi.date().iso();

export const addVacationSchema = Joi.object({
  destination: Joi.string().trim().min(2).max(100).required(),
  description: Joi.string().trim().min(2).required(),
  start_date: isoDate.required(),
  end_date: isoDate.min(Joi.ref("start_date")).required().messages({
    "date.min": "End date cannot be before start date",
  }),
  price: Joi.number().min(0).max(10000).required(),
});

export const editVacationSchema = addVacationSchema;

export const aiRecommendSchema = Joi.object({
  destination: Joi.string().trim().min(2).max(100).required(),
});

export const mcpQuerySchema = Joi.object({
  question: Joi.string().trim().min(2).max(500).required(),
});

/** Validate `data` against `schema`, throwing a 400 HttpError on failure. */
export function validate<T>(schema: Joi.ObjectSchema<T>, data: unknown): T {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });
  if (error) {
    throw badRequest(error.details.map((d) => d.message).join("; "));
  }
  return value as T;
}
