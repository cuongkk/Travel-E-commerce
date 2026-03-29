import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import type { StorageEngine } from "multer";
import { parseCloudinaryEnv } from "./validate";

let cloudinaryConfigured = false;
let multerStorage: StorageEngine | null = null;

function configureCloudinary(): void {
  if (cloudinaryConfigured) {
    return;
  }
  const creds = parseCloudinaryEnv();
  cloudinary.config({
    cloud_name: creds.cloudName,
    api_key: creds.apiKey,
    api_secret: creds.apiSecret,
  });
  cloudinaryConfigured = true;
}

/**
 * Lazily configures Cloudinary from env and returns a shared `multer-storage-cloudinary` engine.
 * Matches previous `helpers/cloudinary.helper.js` behavior (single storage instance per process).
 */
export function getMulterStorage(): StorageEngine {
  if (!multerStorage) {
    configureCloudinary();
    multerStorage = new CloudinaryStorage({
      cloudinary,
      params: {},
    }) as StorageEngine;
  }
  return multerStorage;
}
