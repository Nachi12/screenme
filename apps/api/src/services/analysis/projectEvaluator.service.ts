import { z } from 'zod';
import {
  ProjectAnalysisItemSchema,
  type CandidateProfileInput,
  type ParsedJD,
  type ParsedResume,
  type ProjectAnalysisItem,
} from '@screenme/shared';
import { getAIProvider, type AIUsageMetrics } from '../ai/aiProvider.service.js';
import { CORE_SAFETY_SYSTEM_RULES, sanitizeUntrustedText } from '../ai/promptSafety.js';

const ProjectAnalysisResponseSchema = z.object({
  projects: z.array(ProjectAnalysisItemSchema),
});

export async function evaluateProjects(params: {
  resume: ParsedResume;
  jd: ParsedJD;
  profile: CandidateProfileInput;
}): Promise<{ projects: ProjectAnalysisItem[]; usage: AIUsageMetrics }> {
  const { resume, jd, profile } = params;
  const provider = getAIProvider();

  const projectSections = resume.sections.filter((s) =>
    ['projects', 'internships', 'experience', 'achievements'].includes(s.type)
  );
  const focusedText =
    projectSections.length > 0
      ? projectSections.map((s) => `## ${s.heading}\n${s.content}`).join('\n\n')
      : resume.rawText;

  const userPrompt = `
Evaluate the candidate's projects and practical work relative to this Job Description.
Experience Level: ${profile.experienceLevel}
Hiring Environment: ${profile.hiringEnvironment}
JD Required Skills: ${jd.technicalSkills.join(', ')}

<UNTRUSTED_JD_TEXT>
${sanitizeUntrustedText(jd.rawText, 6000)}
</UNTRUSTED_JD_TEXT>

<UNTRUSTED_RESUME_TEXT>
${sanitizeUntrustedText(focusedText, 9000)}
</UNTRUSTED_RESUME_TEXT>

Return JSON with "projects": array of items with:
- "projectName": string
- "relevanceToJD": "high" | "medium" | "low"
- "technologiesDemonstrated": string[] (ONLY technologies explicitly evidenced in that project)
- "technologiesMissingForJD": string[] (key JD technologies not established by that project)
- "strengths": string[]
- "gaps": string[]
- "complexityAssessment": string
- "recommendedEnhancements": string[] (concrete steps only if the candidate wants to build/verify them)
- "sourceSnippet": exact excerpt from resume describing the project
`.trim();

  const result = await provider.generateStructured({
    systemInstruction: `${CORE_SAFETY_SYSTEM_RULES}
You are evaluating academic, personal, and internship projects for early-career technical roles.
Do NOT assume a project has authentication, REST APIs, databases, testing, or deployment unless explicitly stated.`,
    userPrompt,
    schema: ProjectAnalysisResponseSchema,
  });

  return {
    projects: result.data.projects,
    usage: result.usage,
  };
}

