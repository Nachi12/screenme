import {
  HREvaluationSchema,
  type ATSEvaluation,
  type CandidateProfileInput,
  type HREvaluation,
  type JobMatchEvaluation,
  type ParsedJD,
  type ParsedResume,
} from '@screenme/shared';
import { getAIProvider, type AIUsageMetrics } from '../ai/aiProvider.service.js';
import { CORE_SAFETY_SYSTEM_RULES, sanitizeUntrustedText } from '../ai/promptSafety.js';

export async function evaluateHRImpression(params: {
  resume: ParsedResume;
  jd: ParsedJD;
  profile: CandidateProfileInput;
  ats: ATSEvaluation;
  jobMatch: JobMatchEvaluation;
}): Promise<{ hrEvaluation: HREvaluation; usage: AIUsageMetrics }> {
  const { resume, jd, profile, ats, jobMatch } = params;
  const provider = getAIProvider();

  const userPrompt = `
Simulate a thoughtful, experienced technical recruiter's initial resume screening review.

Context:
- Target Role: ${profile.targetRole || jd.title} at ${jd.company}
- Experience Level: ${profile.experienceLevel}
- Hiring Environment: ${profile.hiringEnvironment}
- Computed ATS Compatibility Score: ${ats.score}/100
- Computed Job Match Score: ${jobMatch.score ?? 'Insufficient data'}/100 (Confidence: ${jobMatch.confidence})

<UNTRUSTED_JD_TEXT>
${sanitizeUntrustedText(jd.rawText, 7000)}
</UNTRUSTED_JD_TEXT>

<UNTRUSTED_RESUME_TEXT>
${sanitizeUntrustedText(resume.rawText, 10000)}
</UNTRUSTED_RESUME_TEXT>

Return JSON with:
- "verdict": one of "Strong Match" | "Potential Match" | "Needs Improvement" | "Significant Gaps"
- "screeningImpression": 2-4 sentences describing first-glance readability, role relevance, and practical credibility
- "reasoningSummary": concise explanation of why this verdict applies
- "strengths": string[]
- "concerns": string[]
- "relevantEvidence": string[]
- "missingEvidence": string[]
- "improvementPriorities": string[] (top 3-5 prioritized actions)
- "readinessGuidance": honest advice on whether to apply now or strengthen specific areas first
`.trim();

  const result = await provider.generateStructured({
    systemInstruction: `${CORE_SAFETY_SYSTEM_RULES}
You are a senior technical recruiter with Indian and global hiring experience across IT services, startups, and product companies.
Never use "selected" or "rejected" predictions. Focus strictly on job-related evidence.`,
    userPrompt,
    schema: HREvaluationSchema,
  });

  return {
    hrEvaluation: result.data,
    usage: result.usage,
  };
}

