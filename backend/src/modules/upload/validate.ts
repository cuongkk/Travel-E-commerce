import Joi from "joi";
import type { CloudinaryCredentials } from "./interface";

const cloudinaryEnvSchema = Joi.object({
  CLOUDINARY_NAME: Joi.string().trim().min(1).required().messages({
    "any.required": "CLOUDINARY_NAME is required",
    "string.empty": "CLOUDINARY_NAME must not be empty",
  }),
  CLOUDINARY_API_KEY: Joi.string().trim().min(1).required().messages({
    "any.required": "CLOUDINARY_API_KEY is required",
    "string.empty": "CLOUDINARY_API_KEY must not be empty",
  }),
  CLOUDINARY_API_SECRET: Joi.string().trim().min(1).required().messages({
    "any.required": "CLOUDINARY_API_SECRET is required",
    "string.empty": "CLOUDINARY_API_SECRET must not be empty",
  }),
}).unknown(true);

/**
 * Validates `process.env` for Cloudinary and returns typed credentials.
 * @throws if any required variable is missing or empty
 */
export function parseCloudinaryEnv(): CloudinaryCredentials {
  const { error, value } = cloudinaryEnvSchema.validate(process.env, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const msg = error.details.map((d) => d.message).join("; ");
    throw new Error(`Cloudinary environment invalid: ${msg}`);
  }

  const env = value as NodeJS.ProcessEnv;

  return {
    cloudName: env.CLOUDINARY_NAME as string,
    apiKey: env.CLOUDINARY_API_KEY as string,
    apiSecret: env.CLOUDINARY_API_SECRET as string,
  };
}
