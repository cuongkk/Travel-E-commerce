import { Request } from "express";

export interface AccountRequest extends Request {
  account?: any;
  user?: {
    role: string;
    id?: string;
    [key: string]: any;
  };
}
