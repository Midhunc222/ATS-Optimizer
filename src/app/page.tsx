"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { analyzeResumeAction } from "@/app/actions";
import { type AnalysisResult } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function Home() {
    const [jobDescription, setJobDescription] = useState("");
    const [resumeText, setResumeText] = useState("");
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setResumeFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append("jobDescription", jobDescription);
        if (resumeFile) {
            formData.append("resumeFile", resumeFile);
        } else {
            formData.append("resumeText", resumeText);
        }

        try {
            const response = await analyzeResumeAction(formData);
            if (response.success && response.data) {
                setResult(response.data);
            } else {
                setError(response.error || "Analysis failed.");
            }
        } catch (err) {
            console.error(err)
            setError("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-background text-foreground p-8 md:p-24">
            <div className="max-w-5xl mx-auto space-y-12">
                <header className="text-center space-y-4">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        Advanced ATS Optimizer
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Optimize your resume for Applicant Tracking Systems and get tailored, domain-specific logic for your experience.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Resume Input</CardTitle>
                            <CardDescription>Paste your resume text or upload a PDF.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Upload PDF
                                </label>
                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="outline"
                                        className="w-full relative overflow-hidden"
                                        onClick={() => document.getElementById("resume-upload")?.click()}
                                    >
                                        <Upload className="mr-2 h-4 w-4" />
                                        {resumeFile ? resumeFile.name : "Choose File"}
                                        <input
                                            id="resume-upload"
                                            type="file"
                                            accept=".pdf,.txt"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </Button>
                                    {resumeFile && (
                                        <Button variant="ghost" size="icon" onClick={() => setResumeFile(null)}>
                                            <div className="h-4 w-4">×</div>
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-card px-2 text-muted-foreground">Or paste text</span>
                                </div>
                            </div>

                            <Textarea
                                placeholder="Paste your resume content here..."
                                className="min-h-[200px]"
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                                disabled={!!resumeFile}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Job Description</CardTitle>
                            <CardDescription>Paste the JD you are targeting.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                placeholder="Paste the Job Description here..."
                                className="min-h-[300px]"
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-center">
                    <Button
                        size="lg"
                        onClick={handleSubmit}
                        disabled={loading || (!resumeFile && !resumeText) || !jobDescription}
                        className="px-8 text-lg"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...
                            </>
                        ) : (
                            "Analyze & Optimize"
                        )}
                    </Button>
                </div>

                {error && (
                    <div className="p-4 rounded-md bg-destructive/15 text-destructive flex items-center justify-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        {error}
                    </div>
                )}

                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-8"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="md:col-span-1 border-primary/20 bg-primary/5">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        ATS Score
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center justify-center space-y-4">
                                    <div className="relative h-32 w-32 flex items-center justify-center">
                                        <svg className="h-full w-full" viewBox="0 0 100 100">
                                            <circle
                                                className="text-secondary stroke-current"
                                                strokeWidth="10"
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                fill="transparent"
                                            ></circle>
                                            <circle
                                                className="text-primary stroke-current"
                                                strokeWidth="10"
                                                strokeLinecap="round"
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                fill="transparent"
                                                strokeDasharray={`${result.score * 2.51} 251.2`}
                                                transform="rotate(-90 50 50)"
                                            ></circle>
                                        </svg>
                                        <span className="absolute text-3xl font-bold">{result.score}%</span>
                                    </div>
                                    <Progress value={result.score} className="w-full" />
                                </CardContent>
                            </Card>

                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle>Missing Keywords</CardTitle>
                                    <CardDescription>Critical skills and terms found in the JD but missing from your resume.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {result.missing_keywords.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {result.missing_keywords.map((keyword, i) => (
                                                <span
                                                    key={i}
                                                    className="px-3 py-1 bg-destructive/10 text-destructive rounded-full text-sm font-medium border border-destructive/20"
                                                >
                                                    {keyword}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-green-500 gap-2">
                                            <CheckCircle className="h-5 w-5" />
                                            <span>Great job! No major keywords missing.</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="border-blue-500/20 bg-blue-500/5">
                            <CardHeader>
                                <CardTitle>Review & Impact Suggestions</CardTitle>
                                <CardDescription>
                                    Tailored "Star Method" bullet points to enhance your resume based on domain-specific tools matching the JD.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-4">
                                    {result.tailored_suggestions.map((suggestion, i) => (
                                        <motion.li
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex gap-3 p-3 rounded-lg bg-background/50 border border-border"
                                        >
                                            <div className="mt-1 bg-primary/10 p-1 rounded-full h-fit">
                                                <FileText className="h-4 w-4 text-primary" />
                                            </div>
                                            <span className="text-sm leading-relaxed">{suggestion}</span>
                                        </motion.li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </main>
    );
}
