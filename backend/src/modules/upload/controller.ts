import type { RequestHandler } from "express";

/**
 * Thin HTTP layer for future dedicated upload APIs (direct browser → server → Cloudinary).
 * Not mounted by the legacy Pug app; domain routes still attach multer inline.
 */
export const UploadController = {
  /**
   * Optional health-style handler (e.g. mount behind admin only when needed).
   */
  ready: ((_req, res) => {
    res.sendStatus(204);
  }) satisfies RequestHandler,
} as const;
