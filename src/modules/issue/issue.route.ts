import { Router } from "express";
import { createIssue, getAllIssues } from "./issue.controller";
import { authGuard } from "../../middleware/auth.middleware";

const router = Router();

router.post("/", authGuard, createIssue);
router.get("/", getAllIssues);

export const IssueRoutes = router;
