import { Request, Response } from "express";
import { AuthRequest } from "../../types";
import { insertIssue, fetchAllIssues, fetchSingleIssue, updateIssueData, deleteIssueData } from "./issue.service";
import { findUserByEmail } from "../auth/auth.service";
import pool from "../../database/db";
import { sendResponse, sendError } from "../../utils/sendResponse";

export const createIssue = async (req: Request, res: Response) => {
  try {
    const { title, description, type } = req.body;
    const user = (req as AuthRequest).user!;

    if (!title || !description || !type) {
      return sendError(res, 400, "Title, description, and type are required");
    }

    if (title.length > 150) {
      return sendError(res, 400, "Title must be maximum 150 characters");
    }

    if (description.length < 20) {
      return sendError(res, 400, "Description must be minimum 20 characters");
    }

    if (type !== "bug" && type !== "feature_request") {
      return sendError(res, 400, "Type must be bug or feature_request");
    }

    // Validate reporter exists (P5 requirement)
    const reporterCheck = await pool.query(`SELECT id FROM users WHERE id = $1`, [user.id]);
    if (reporterCheck.rowCount === 0) {
      return sendError(res, 404, "Reporter not found");
    }

    const newIssue = await insertIssue(title, description, type, user.id);

    return sendResponse(res, 201, true, "Issue created successfully", newIssue);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return sendError(res, 500, "Something went wrong!", errMessage);
  }
};

export const getAllIssues = async (req: Request, res: Response) => {
  try {
    const sort = req.query.sort === "oldest" ? "oldest" : "newest";
    const type = req.query.type as string | undefined;
    const status = req.query.status as string | undefined;

    const issues = await fetchAllIssues(sort, type, status);

    return sendResponse(res, 200, true, "Issues retrived successfully", issues);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return sendError(res, 500, "Something went wrong!", errMessage);
  }
};

export const getSingleIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const issue = await fetchSingleIssue(id as string);

    if (!issue) {
      return sendError(res, 404, "Issue not found");
    }

    return sendResponse(res, 200, true, "Issue retrived successfully", issue);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return sendError(res, 500, "Something went wrong!", errMessage);
  }
};

export const updateIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, type, status } = req.body;
    const user = (req as AuthRequest).user!;

    const existingIssue = await fetchSingleIssue(id as string);

    if (!existingIssue) {
      return sendError(res, 404, "Issue not found");
    }

    // Role verification
    if (user.role === "contributor") {
      // the reporter inside existingIssue contains the reporter details
      if (!existingIssue.reporter || existingIssue.reporter.id !== user.id) {
        return sendError(res, 403, "Forbidden: You can only update your own issues");
      }
      if (existingIssue.status !== "open") {
        return sendError(res, 409, "Conflict: You can only update open issues");
      }
      if (status && status !== existingIssue.status) {
         return sendError(res, 403, "Forbidden: Contributors cannot change status");
      }
    }

    if (title && title.length > 150) {
      return sendError(res, 400, "Title must be maximum 150 characters");
    }

    if (description && description.length < 20) {
      return sendError(res, 400, "Description must be minimum 20 characters");
    }

    if (type && type !== "bug" && type !== "feature_request") {
      return sendError(res, 400, "Type must be bug or feature_request");
    }

    if (status && status !== "open" && status !== "in_progress" && status !== "resolved") {
      return sendError(res, 400, "Status must be open, in_progress, or resolved");
    }

    const newTitle = title || existingIssue.title;
    const newDescription = description || existingIssue.description;
    const newType = type || existingIssue.type;
    const newStatus = status || existingIssue.status;

    const updatedIssue = await updateIssueData(id as string, newTitle, newDescription, newType, newStatus);

    return sendResponse(res, 200, true, "Issue updated successfully", updatedIssue);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return sendError(res, 500, "Something went wrong!", errMessage);
  }
};

export const deleteIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingIssue = await fetchSingleIssue(id as string);

    if (!existingIssue) {
      return sendError(res, 404, "Issue not found");
    }

    await deleteIssueData(id as string);

    return sendResponse(res, 200, true, "Issue deleted successfully");
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return sendError(res, 500, "Something went wrong!", errMessage);
  }
};
