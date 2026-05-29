import { Router } from "express";
import { createIssue, getAllIssues, getSingleIssue, updateIssue } from "./issue.controller";
import { authGuard } from "../../middleware/auth.middleware";

const router = Router();

router.post("/", authGuard, createIssue);
router.get("/", getAllIssues);
router.get("/:id", getSingleIssue);
router.patch("/:id", authGuard, updateIssue);

export const IssueRoutes = router;
