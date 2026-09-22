import express from "express";
import cors from "cors";
import { db } from "./prisma/db.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_request, response) => {
  response.json({ message: "Job Application API is running!" });
});

app.get("/api/test-db", async (_request, response) => {
  // const applications = await db.application.findMany();

  const applications = await db.orm.public.Application.all();

  response.json(applications);
});


app.post("/api/applications", async (request, response) => {
  try {
    const application = await db.orm.public.Application.create(request.body);

    response.status(201).json(application);
  } catch (error) {
    console.error(error);

    response.status(500).json({
      message: "Failed to create application",
    });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
