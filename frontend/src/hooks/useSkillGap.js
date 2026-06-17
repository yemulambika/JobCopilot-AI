import { useState, useCallback } from "react";
import { analyzeSkillGap } from "../services/api";

export function useSkillGap() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = useCallback(async (resumeText, jobDescription) => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError("Resume text and job description are required");
      return null;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await analyzeSkillGap(resumeText, jobDescription);
      const data = res.data;
      setResult(data);
      return data;
    } catch (err) {
      const msg = err.response?.data?.error || "Analysis failed. Please try again.";
      setError(msg);
      console.error("Skill Gap Analysis error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { analyze, result, isLoading, error, reset };
}