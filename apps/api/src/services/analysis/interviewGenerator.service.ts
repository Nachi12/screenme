import { z } from 'zod';
import {
  InterviewQuestionSchema,
  type CandidateProfileInput,
  type InterviewQuestion,
  type ParsedJD,
  type ParsedResume,
  type SkillAnalysis,
} from '@screenme/shared';
import { getAIProvider, type AIUsageMetrics } from '../ai/aiProvider.service.js';
import { CORE_SAFETY_SYSTEM_RULES, sanitizeUntrustedText } from '../ai/promptSafety.js';

const InterviewResponseSchema = z.object({
  questions: z.array(InterviewQuestionSchema),
});

export async function generateInterviewQuestions(params: {
  resume: ParsedResume;
  jd: ParsedJD;
  skillAnalysis: SkillAnalysis;
  profile: CandidateProfileInput;
}): Promise<{ interviewQuestions: InterviewQuestion[]; usage: AIUsageMetrics }> {
  const { resume, jd, skillAnalysis, profile } = params;
  const provider = getAIProvider();

  const userPrompt = `
Generate 6 to 10 role-specific interview preparation questions tailored to this candidate's actual resume and the target JD.
Include a mix across all 5 categories: "technical", "project_based", "problem_solving", "behavioral", and "missing_requirement".

Target Role: ${profile.targetRole || jd.title}
Experience Level: ${profile.experienceLevel}
Demonstrated Skills: ${skillAnalysis.demonstrated.join(', ')}
Missing / Gap Skills: ${skillAnalysis.missing.map((m) => m.skill).join(', ')}

<UNTRUSTED_JD_TEXT>
${sanitizeUntrustedText(jd.rawText, 5000)}
</UNTRUSTED_JD_TEXT>

<UNTRUSTED_RESUME_TEXT>
${sanitizeUntrustedText(resume.rawText, 9000)}
</UNTRUSTED_RESUME_TEXT>

Return JSON with "questions": array of:
- "id": string ("iq-1", ...)
- "category": "technical" | "project_based" | "problem_solving" | "behavioral" | "missing_requirement"
- "question": string (reference candidate's actual projects/skills where relevant)
- "difficulty": "foundational" | "intermediate" | "advanced"
- "skillTested": string
- "whyInterviewerAsks": string
- "suggestedAnswerFramework": structured guidance on how to answer honestly (do NOT fabricate candidate stories)
`.trim();

  const result = await provider.generateStructured({
    systemInstruction: `${CORE_SAFETY_SYSTEM_RULES}
You are a technical interviewer preparing realistic, fair questions calibrated to the candidate's experience level.`,
    userPrompt,
    schema: InterviewResponseSchema,
  });

  return {
    interviewQuestions: result.data.questions,
    usage: result.usage,
  };
}

