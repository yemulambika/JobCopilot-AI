import { useState } from "react";
import { analyzeResumeAI, generateCoverLetter, generateAI } from "../services/api";

/**
 * Hook to analyze a resume using Gemini AI.
 */
export function useAnalyzeResumeAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const analyze = async (resumeText, jobDescription) => {
    try {
      setLoading(true);
      setError(null);
      const res = await analyzeResumeAI(resumeText, jobDescription);
      setData(res.data);
      return res.data;
    } catch (err) {
      const message = err.response?.data?.error || "AI analysis failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { analyze, data, loading, error };
}

/**
 * Hook to generate a cover letter using Gemini AI.
 */
export function useCoverLetter() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const generate = async (resumeText, jobDescription, tone) => {
    try {
      setLoading(true);
      setError(null);
      const res = await generateCoverLetter(resumeText, jobDescription, tone);
      setData(res.data);
      return res.data;
    } catch (err) {
      const message = err.response?.data?.error || "Cover letter generation failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { generate, data, loading, error };
}

/**
 * Hook for generic AI prompt generation.
 */
export function useAIGenerate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const generate = async (prompt, options) => {
    try {
      setLoading(true);
      setError(null);
      const res = await generateAI(prompt, options);
      setData(res.data);
      return res.data;
    } catch (err) {
      const message = err.response?.data?.error || "AI generation failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { generate, data, loading, error };
}