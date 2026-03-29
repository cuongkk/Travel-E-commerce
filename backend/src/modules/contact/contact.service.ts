import type { Request } from "express";

export const list = async (req: Request): Promise<{ pageTitle: string }> => {
  return {
    pageTitle: "Liên hệ",
  };
};
