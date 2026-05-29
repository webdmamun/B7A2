import { Request, Response } from "express";
import pool from "../../database/db";
import bcrypt from "bcrypt";
import { sendResponse, sendError } from "../../utils/sendResponse";

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 400, "Name, email, and password are required");
    }

    // Role defaults to contributor
    const userRole = role === "maintainer" ? "maintainer" : "contributor";
    
    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into NeonDB
    const result = await pool.query(
      \`INSERT INTO users (name, email, password, role) 
       VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at, updated_at\`,
      [name, email, hashedPassword, userRole]
    );

    const newUser = result.rows[0];

    return sendResponse(res, 201, true, "User registered successfully", newUser);
  } catch (error: any) {
    // 23505 is the PostgreSQL error code for unique violation
    if (error.code === "23505") {
      return sendError(res, 400, "Email already exists");
    }
    return sendError(res, 500, "Something went wrong!", error.message);
  }
};
