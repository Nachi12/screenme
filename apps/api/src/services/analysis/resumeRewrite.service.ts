import { z } from 'zod';
import {
  RewriteSuggestionSchema,
  type ParsedJD,
  type ParsedResume,
  type RewriteSuggestion,
} from '@screenme/shared';
import { getAIProvider, type AIUsageMetrics } from '../ai/aiProvider.service.js';
import { CORE_SAFETY_SYSTEM_RULES, sanitizeUntrustedText } from '../ai/promptSafety.js';

const RewriteResponseSchema = z.object({
  rewrites: z.array(RewriteSuggestionSchema),
});

export async function generateResumeRewrites(params: {
  resume: ParsedResume;
  jd: ParsedJD;
}): Promise<{ rewrites: RewriteSuggestion[]; usage: AIUsageMetrics }> {
  const { resume, jd } = params;
  const provider = getAIProvider();

  const userPrompt = `
Identify 3 to 6 weak or vague resume bullets from the candidate's resume and propose evidence-grounded improvements aligned with the JD.

STRICT NON-FABRICATION RULE:
- NEVER invent numbers, percentages, user counts, revenue, team sizes, or technologies not in the original resume.
- If a metric or implementation detail would strengthen the bullet, use a bracketed placeholder like [X] or [endpoint count] and list it in "claimsRequiringVerification".

<UNTRUSTED_JD_TEXT>
${sanitizeUntrustedText(jd.rawText, 5000)}
</UNTRUSTED_JD_TEXT>

<UNTRUSTED_RESUME_TEXT>
${sanitizeUntrustedText(resume.rawText, 10000)}
</UNTRUSTED_RESUME_TEXT>

Return JSON with "rewrites": array of objects:
- "id": string ("rw-1", "rw-2", ...)
- "section": string (e.g., "Projects — CampusKart")
- "originalText": exact weak bullet or sentence from the resume
- "suggestedRewrite": improved bullet preserving strict honesty
- "whyItIsBetter": concise explanation
- "relevantJDSkills": string[]
- "claimsRequiringVerification": string[] (things the candidate must confirm before using)
`.trim();

  const result = await provider.generateStructured({
    systemInstruction: `${CORE_SAFETY_SYSTEM_RULES}
You are an honest career mentor helping candidates articulate real work clearly without fabricating experience.`,
    userPrompt,
    schema: RewriteResponseSchema,
  });

  return {
    rewrites: result.data.rewrites,
    usage: result.usage,
  };
}

