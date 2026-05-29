import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../../config";
import { insertUser, findUserByEmail } from "./auth.service";
import { sendResponse, sendError } from "../../utils/sendResponse";

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 400, "Name, email, and password are required");
    }

    let userRole = "contributor";
    if (role) {
      if (role !== "contributor" && role !== "maintainer") {
        return sendError(res, 400, "Role must be contributor or maintainer");
      }
      userRole = role;
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await insertUser(name, email, hashedPassword, userRole);

    return sendResponse(res, 201, true, "User registered successfully", newUser);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "23505") {
      return sendError(res, 400, "Email already exists");
    }
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return sendError(res, 500, "Something went wrong!", errMessage);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, "Email and password are required");
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return sendError(res, 401, "Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 401, "Invalid credentials");
    }

    const tokenPayload = {
      id: user.id,
      name: user.name,
      role: user.role,
    };

    const token = jwt.sign(tokenPayload, config.jwt_secret as string, { expiresIn: "1d" });

    const userWithoutPassword = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    return sendResponse(res, 200, true, "Login successful", { token, user: userWithoutPassword });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return sendError(res, 500, "Something went wrong!", errMessage);
  }
};
