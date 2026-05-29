import express, { Application, Request, Response } from "express";
import cors from "cors";
import { AuthRoutes } from "./modules/auth/auth.route";
import { IssueRoutes } from "./modules/issue/issue.route";

const app: Application = express();

app.use(cors());
app.use(express.json());

// Main App Routes
app.use("/api/auth", AuthRoutes);
app.use("/api/issues", IssueRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Welcome to DevPulse API",
  });
});

export default app;
