import { Router } from "express";
import { createIssue, getAllIssues, getSingleIssue, updateIssue, deleteIssue } from "./issue.controller";
import { authGuard, requireRole } from "../../middleware/auth.middleware";

const router = Router();

router.post("/", authGuard, createIssue);
router.get("/", getAllIssues);
router.get("/:id", getSingleIssue);
router.patch("/:id", authGuard, updateIssue);
router.delete("/:id", authGuard, requireRole("maintainer"), deleteIssue);

export const IssueRoutes = router;
