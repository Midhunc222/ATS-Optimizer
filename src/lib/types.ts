import { z } from "zod";

export const AnalysisSchema = z.object({
    score: z.number().min(0).max(100),
    missing_keywords: z.array(z.string()),
    tailored_suggestions: z.array(z.string()),
});

export type AnalysisResult = z.infer<typeof AnalysisSchema>;
