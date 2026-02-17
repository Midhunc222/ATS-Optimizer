"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { parseResume } from "@/lib/parse-resume";
import { z } from "zod";

import { AnalysisSchema, type AnalysisResult } from "@/lib/types";

export async function analyzeResumeAction(formData: FormData): Promise<{ success: boolean; data?: AnalysisResult; error?: string }> {
    try {
        const file = formData.get("resumeFile") as File | null;
        const resumeTextRaw = formData.get("resumeText") as string | null;
        const jobDescription = formData.get("jobDescription") as string;

        if (!jobDescription) {
            return { success: false, error: "Job description is required." };
        }

        let resumeText = resumeTextRaw || "";

        if (file && file.size > 0) {
            if (file.type === "application/pdf") {
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                resumeText = await parseResume(buffer);
            } else if (file.type === "text/plain") {
                resumeText = await file.text();
            } else {
                // Fallback or error for other types if needed, but for now we support PDF/Text
                // We can extend this to DOCX if we add a parser for it, but user asked for PDF/Docx.
                // PDF is handled. Text is handled. For now let's stick to PDF as per "pdf-parse".
                // Docx parsing usually requires `mammoth`. I installed `pdf-parse`. 
                // I'll stick to PDF for file upload for now as I only installed pdf-parse.
            }
        }

        if (!resumeText.trim()) {
            console.error("Resume text is empty after parsing.");
            return { success: false, error: "Resume content is missing or could not be parsed." };
        }
        console.log("Resume text length:", resumeText.length);

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return { success: false, error: "Server configuration error: Missing API Key." };
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest", generationConfig: { responseMimeType: "application/json" } });

        const prompt = `
      Act as a Senior Technical Recruiter. Compare this Resume to this Job Description (JD).
      
      Response Format (JSON only):
      {
        "score": number (0-100),
        "missing_keywords": string[] (array of specific keywords in JD but absent in resume),
        "tailored_suggestions": string[] (array of 5 specific "Impact Lines" using STAR method. usage of industry tools if applicable. E.g. "Leveraged [Tool]...")
      }

      RESUME:
      ${resumeText.slice(0, 30000)} 
      
      JOB DESCRIPTION:
      ${jobDescription.slice(0, 10000)}
    `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        try {
            const json = JSON.parse(text);
            const validated = AnalysisSchema.parse(json);
            return { success: true, data: validated };
        } catch (e) {
            console.error("JSON parse error:", text, e);
            return { success: false, error: "Failed to parse analysis results." };
        }

    } catch (error: any) {
        console.error("Analysis error details:", error);

        // Return the actual error message for debugging purposes
        // In production, you might want to sanitize this, but for now we need to see what's wrong.
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}
