import { Request, Response } from "express";
import { insertIssue, fetchAllIssues } from "./issue.service";
import { sendResponse, sendError } from "../../utils/sendResponse";

export const createIssue = async (req: Request, res: Response) => {
  try {
    const { title, description, type } = req.body;
    const user = (req as any).user;

    if (!title || !description || !type) {
      return sendError(res, 400, "Title, description, and type are required");
    }

    if (type !== "bug" && type !== "feature_request") {
      return sendError(res, 400, "Type must be bug or feature_request");
    }

    const newIssue = await insertIssue(title, description, type, user.id);

    return sendResponse(res, 201, true, "Issue created successfully", newIssue);
  } catch (error: any) {
    return sendError(res, 500, "Something went wrong!", error.message);
  }
};

export const getAllIssues = async (req: Request, res: Response) => {
  try {
    const sort = req.query.sort === "oldest" ? "oldest" : "newest";
    const type = req.query.type as string | undefined;
    const status = req.query.status as string | undefined;

    const issues = await fetchAllIssues(sort, type, status);

    return sendResponse(res, 200, true, "Issues retrived successfully", issues);
  } catch (error: any) {
    return sendError(res, 500, "Something went wrong!", error.message);
  }
};
