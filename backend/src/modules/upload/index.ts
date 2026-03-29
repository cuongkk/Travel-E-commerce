/**
 * Public API for the upload module (Cloudinary + multer storage).
 */
export { getMulterStorage } from "./service";
export { parseCloudinaryEnv } from "./validate";
export { UploadController } from "./controller";
export { default as uploadRouter } from "./upload.route";
export type { CloudinaryCredentials, MulterFieldDefinition } from "./interface";
