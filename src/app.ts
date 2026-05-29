import express, { Application, Request, Response } from "express";
import cors from "cors";
import { AuthRoutes } from "./modules/auth/auth.route";

const app: Application = express();

app.use(cors());
app.use(express.json());

// Main App Routes
app.use("/api/auth", AuthRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Welcome to DevPulse API",
  });
});

export default app;
