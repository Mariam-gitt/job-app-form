
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import "./JobApplicationForm.css";

// Define all validation rules for our form.
const jobApplicationSchema = z
  .object({
    // Personal information.
    name: z.string().min(1, "Full name is required"),

    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email"),

    phone: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^\d{10,}$/, "Please enter a valid phone number"),

    location: z.string().min(1, "Location is required"),

    // Experience information.
    experienceLevel: z
      .string()
      .min(1, "Please select your experience level"),

    yearsOfExperience: z
      .number()
      .min(0, "Years cannot be negative")
      .max(50, "Please enter a valid number of years"),

    currentlyEmployed: z
      .string()
      .min(1, "Please select an option"),

    // These become conditionally required below.
    company: z.string(),
    jobTitle: z.string(),

    // Skills.
    skills: z
      .array(z.string())
      .min(1, "Please select at least one skill"),

    // Projects.
    projectName: z.string(),
    projectGithub: z.string(),
    projectDescription: z.string(),

    // Links.
    github: z.string(),
    linkedin: z.string(),
    portfolio: z.string(),

    // Resume.
    resume: z.any(),
  })
  .superRefine((data, context) => {
    // Company is required when currently employed.
    if (data.currentlyEmployed === "yes" && !data.company.trim()) {
      context.addIssue({
        code: "custom",
        path: ["company"],
        message: "Company is required",
      });
    }

    // Job title is required when currently employed.
    if (data.currentlyEmployed === "yes" && !data.jobTitle.trim()) {
      context.addIssue({
        code: "custom",
        path: ["jobTitle"],
        message: "Job title is required",
      });
    }
  });

// Generate the TypeScript type from our Zod schema.
type JobApplicationData = z.infer<typeof jobApplicationSchema>;

export default function JobApplicationForm() {
  // Controls whether the success popup is visible.
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Create our React Hook Form instance.
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<JobApplicationData>({
    // Give Zod responsibility for validation.
    resolver: zodResolver(jobApplicationSchema),

    // Validate a field when the user leaves it.
    mode: "onBlur",

    // Once a field has an error, validate it while the user fixes it.
    reValidateMode: "onChange",

    // Set the initial values of the form.
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      location: "",
      experienceLevel: "",
      yearsOfExperience: 0,
      currentlyEmployed: "",
      company: "",
      jobTitle: "",
      skills: [],
      projectName: "",
      projectGithub: "",
      projectDescription: "",
      github: "",
      linkedin: "",
      portfolio: "",
      resume: undefined,
    },
  });

  // Watch employment status.
  const currentlyEmployed = watch("currentlyEmployed");

  // This function runs only when the form passes validation.
  async function onSubmit(data: JobApplicationData) {
    // Convert the form data into the shape expected by our backend.
    const applicationData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      location: data.location,
      experienceLevel: data.experienceLevel,
      yearsOfExperience: data.yearsOfExperience,

      // Convert "yes"/"no" into true/false for PostgreSQL.
      currentlyEmployed: data.currentlyEmployed === "yes",

      company: data.company || null,
      jobTitle: data.jobTitle || null,
      skills: data.skills,
      projectName: data.projectName || null,
      projectGithub: data.projectGithub || null,
      projectDescription: data.projectDescription || null,
      github: data.github || null,
      linkedin: data.linkedin || null,
      portfolio: data.portfolio || null,

      // Resume uploading will be handled separately later.
      resumeUrl: null,
    };

    try {
      // Send the application to our Express backend.
      const response = await fetch(
        "http://localhost:5000/api/applications",
        {
          method: "POST",

          // Tell Express that we are sending JSON.
          headers: {
            "Content-Type": "application/json",
          },

          // Convert our JavaScript object into JSON.
          body: JSON.stringify(applicationData),
        },
      );

      // Convert the backend response from JSON into a JavaScript object.
      const result = await response.json();

      // Check whether the backend accepted the application.
      if (!response.ok) {
        throw new Error(
          result.message || "Failed to submit application",
        );
      }

      // Show the saved application in the browser console.
      console.log("Application saved:", result);

      // Clear the form.
      reset();

      // Show the success popup.
      setIsSubmitted(true);

      // Hide the popup after 4 seconds.
      setTimeout(() => {
        setIsSubmitted(false);
      }, 4000);
    } catch (error) {
      // Show any request/server errors in the console.
      console.error("Submission failed:", error);
    }
  }

  return (
    <>
      {/* Success popup */}
      {isSubmitted && (
        <div className="success-popup">
          <span className="success-icon">✓</span>

          <div>
            <strong>Application submitted!</strong>
            <p>Your application has been saved successfully.</p>
          </div>
        </div>
      )}

      <form
        className="job-form"
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* =========================
            Header
        ========================= */}
        <div className="form-header">
          <p className="eyebrow">CAREER APPLICATION</p>

          <h1>Developer Job Application</h1>

          <p>
            Tell us a little about yourself, your experience,
            and the projects you've built.
          </p>
        </div>

        {/* =========================
            Personal Information
        ========================= */}
        <section className="form-section">
          <h2>Personal Information</h2>

          <div className="personal-fields">
            {/* Full name */}
            <div className="field">
              <label htmlFor="name">Full Name</label>

              <input
                id="name"
                type="text"
                placeholder="Your full name"
                {...register("name")}
              />

              {errors.name && (
                <p className="error">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="field">
              <label htmlFor="email">Email</label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
              />

              {errors.email && (
                <p className="error">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div className="field">
              <label htmlFor="phone">Phone</label>

              <input
                id="phone"
                type="tel"
                placeholder="03001234567"
                {...register("phone")}
              />

              {errors.phone && (
                <p className="error">{errors.phone.message}</p>
              )}
            </div>

            {/* Location */}
            <div className="field">
              <label htmlFor="location">Location</label>

              <input
                id="location"
                type="text"
                placeholder="City, Country"
                {...register("location")}
              />

              {errors.location && (
                <p className="error">{errors.location.message}</p>
              )}
            </div>
          </div>
        </section>

        {/* =========================
            Experience
        ========================= */}
        <section className="form-section">
          <h2>Experience</h2>

          {/* Experience level */}
          <fieldset className="option-group">
            <legend>Experience Level</legend>

            <label className="option">
              <input
                type="radio"
                value="student"
                {...register("experienceLevel")}
              />
              Student
            </label>

            <label className="option">
              <input
                type="radio"
                value="intern"
                {...register("experienceLevel")}
              />
              Intern
            </label>

            <label className="option">
              <input
                type="radio"
                value="junior"
                {...register("experienceLevel")}
              />
              Junior
            </label>

            <label className="option">
              <input
                type="radio"
                value="mid"
                {...register("experienceLevel")}
              />
              Mid-level
            </label>

            <label className="option">
              <input
                type="radio"
                value="senior"
                {...register("experienceLevel")}
              />
              Senior
            </label>
          </fieldset>

          {errors.experienceLevel && (
            <p className="error">
              {errors.experienceLevel.message}
            </p>
          )}

          {/* Years of experience */}
          <div className="field">
            <label htmlFor="yearsOfExperience">
              Years of Experience
            </label>

            <input
              id="yearsOfExperience"
              type="number"
              min="0"
              max="50"
              {...register("yearsOfExperience", {
                valueAsNumber: true,
              })}
            />

            {errors.yearsOfExperience && (
              <p className="error">
                {errors.yearsOfExperience.message}
              </p>
            )}
          </div>

          {/* Employment status */}
          <fieldset className="option-group">
            <legend>Currently Employed?</legend>

            <label className="option">
              <input
                type="radio"
                value="yes"
                {...register("currentlyEmployed")}
              />
              Yes
            </label>

            <label className="option">
              <input
                type="radio"
                value="no"
                {...register("currentlyEmployed")}
              />
              No
            </label>
          </fieldset>

          {errors.currentlyEmployed && (
            <p className="error">
              {errors.currentlyEmployed.message}
            </p>
          )}

          {/* Conditional employment fields */}
          {currentlyEmployed === "yes" && (
            <>
              <div className="field">
                <label htmlFor="company">Company</label>

                <input
                  id="company"
                  type="text"
                  placeholder="Company name"
                  {...register("company")}
                />

                {errors.company && (
                  <p className="error">
                    {errors.company.message}
                  </p>
                )}
              </div>

              <div className="field">
                <label htmlFor="jobTitle">Job Title</label>

                <input
                  id="jobTitle"
                  type="text"
                  placeholder="e.g. Software Engineer"
                  {...register("jobTitle")}
                />

                {errors.jobTitle && (
                  <p className="error">
                    {errors.jobTitle.message}
                  </p>
                )}
              </div>
            </>
          )}
        </section>

        {/* =========================
            Skills
        ========================= */}
        <section className="form-section">
          <h2>Skills</h2>

          <fieldset className="option-group">
            <legend>Select your skills</legend>

            <label className="option">
              <input
                type="checkbox"
                value="JavaScript"
                {...register("skills")}
              />
              JavaScript
            </label>

            <label className="option">
              <input
                type="checkbox"
                value="React"
                {...register("skills")}
              />
              React
            </label>

            <label className="option">
              <input
                type="checkbox"
                value="Next.js"
                {...register("skills")}
              />
              Next.js
            </label>

            <label className="option">
              <input
                type="checkbox"
                value="Node.js"
                {...register("skills")}
              />
              Node.js
            </label>

            <label className="option">
              <input
                type="checkbox"
                value="Python"
                {...register("skills")}
              />
              Python
            </label>

            <label className="option">
              <input
                type="checkbox"
                value="Java"
                {...register("skills")}
              />
              Java
            </label>
          </fieldset>

          {errors.skills && (
            <p className="error">{errors.skills.message}</p>
          )}
        </section>

        {/* =========================
            Projects
        ========================= */}
        <section className="form-section">
          <h2>Projects</h2>

          <div className="field">
            <label htmlFor="projectName">Project Name</label>

            <input
              id="projectName"
              type="text"
              placeholder="e.g. Movie Explorer"
              {...register("projectName")}
            />
          </div>

          <div className="field">
            <label htmlFor="projectGithub">
              GitHub Repository
            </label>

            <input
              id="projectGithub"
              type="url"
              placeholder="https://github.com/username/project"
              {...register("projectGithub")}
            />
          </div>

          <div className="field">
            <label htmlFor="projectDescription">
              Project Description
            </label>

            <textarea
              id="projectDescription"
              placeholder="Briefly describe what you built..."
              {...register("projectDescription")}
            />
          </div>
        </section>

        {/* =========================
            Links
        ========================= */}
        <section className="form-section">
          <h2>Links</h2>

          <div className="field">
            <label htmlFor="github">GitHub</label>

            <input
              id="github"
              type="url"
              placeholder="https://github.com/username"
              {...register("github")}
            />
          </div>

          <div className="field">
            <label htmlFor="linkedin">LinkedIn</label>

            <input
              id="linkedin"
              type="url"
              placeholder="https://linkedin.com/in/username"
              {...register("linkedin")}
            />
          </div>

          <div className="field">
            <label htmlFor="portfolio">Portfolio</label>

            <input
              id="portfolio"
              type="url"
              placeholder="https://yourportfolio.com"
              {...register("portfolio")}
            />
          </div>
        </section>

        {/* =========================
            Resume
        ========================= */}
        <section className="form-section">
          <h2>Resume</h2>

          <div className="field">
            <label htmlFor="resume">Upload Resume</label>

            <input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              {...register("resume")}
            />
          </div>
        </section>

        {/* =========================
            Submit
        ========================= */}
        <button className="submit-button" type="submit">
          Submit Application
        </button>
      </form>
    </>
  );
}

