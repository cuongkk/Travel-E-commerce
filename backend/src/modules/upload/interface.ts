/**
 * Credentials read from environment (see `.env.example`: CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET).
 */
export interface CloudinaryCredentials {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

/**
 * Preset for `multer.fields` / `single` — use in domain routes (tour, category, …).
 */
export interface MulterFieldDefinition {
  name: string;
  maxCount?: number;
}
