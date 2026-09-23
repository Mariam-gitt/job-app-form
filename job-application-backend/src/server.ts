import express from "express";
import cors from "cors";
import { db } from "./prisma/db.js";
import multer from "multer";
import { put } from "@vercel/blob";
// We'll upload request.file to Vercel Blob here.

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
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

app.post(
  "/api/upload-resume",
  upload.single("resume"),
  async (request, response) => {
    try {
      if (!request.file) {
        return response.status(400).json({
          message: "Resume is required",
        });
      }

      const blob = await put(
        request.file.originalname,
        request.file.buffer,
        {
          access: "private",
        },
      );

      return response.status(200).json({
        resumeUrl: blob.url,
      });
    } catch (error) {
      console.error(error);

      return response.status(500).json({
        message: "Failed to upload resume",
      });
    }
  },
);


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
