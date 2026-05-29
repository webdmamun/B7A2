import { Request } from "express";

export interface ITokenPayload {
  id: number;
  name: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: ITokenPayload;
}

export interface IResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
}
