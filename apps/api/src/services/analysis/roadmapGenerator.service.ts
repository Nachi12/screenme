import { z } from 'zod';
import {
  ROADMAP_DISCLAIMER,
  RoadmapTaskSchema,
  type CandidateProfileInput,
  type ParsedJD,
  type RoadmapTask,
  type SkillAnalysis,
} from '@screenme/shared';
import { getAIProvider, type AIUsageMetrics } from '../ai/aiProvider.service.js';
import { CORE_SAFETY_SYSTEM_RULES } from '../ai/promptSafety.js';

const RoadmapResponseSchema = z.object({
  durationWeeks: z.number().int().min(2).max(4),
  tasks: z.array(RoadmapTaskSchema),
});

export async function generateImprovementRoadmap(params: {
  jd: ParsedJD;
  skillAnalysis: SkillAnalysis;
  profile: CandidateProfileInput;
}): Promise<{
  roadmap: { durationWeeks: number; disclaimer: string; tasks: RoadmapTask[] };
  usage: AIUsageMetrics;
}> {
  const { jd, skillAnalysis, profile } = params;
  const provider = getAIProvider();

  const userPrompt = `
Build a targeted 2 to 4 week improvement plan based strictly on the actual skill gaps for this target role.
Do NOT recommend generic unrelated courses. Every task must tie directly to a missing or partial JD requirement.

Target Role: ${profile.targetRole || jd.title}
Experience Level: ${profile.experienceLevel}
Hiring Environment: ${profile.hiringEnvironment}
Demonstrated Skills: ${skillAnalysis.demonstrated.join(', ') || 'None'}
Partial Skills: ${skillAnalysis.partial.join(', ') || 'None'}
Missing / Gap Details: ${JSON.stringify(skillAnalysis.missing, null, 2)}

Return JSON with:
- "durationWeeks": integer between 2 and 4
- "tasks": 4 to 8 actionable tasks ordered by week:
  - "taskId": string ("rm-w1-1", etc.)
  - "week": 1..4
  - "skill": string
  - "title": string
  - "description": string
  - "priority": "high" | "medium" | "low"
  - "estimatedEffort": string (e.g., "6–8 hours")
  - "supportingProjectSuggestion": concrete feature/mini-project they can build and add to resume once actually implemented
  - "completed": false
`.trim();

  const result = await provider.generateStructured({
    systemInstruction: `${CORE_SAFETY_SYSTEM_RULES}
You are designing a practical 2–4 week upskilling and portfolio-strengthening plan for early-career developers.`,
    userPrompt,
    schema: RoadmapResponseSchema,
  });

  return {
    roadmap: {
      durationWeeks: result.data.durationWeeks,
      disclaimer: ROADMAP_DISCLAIMER,
      tasks: result.data.tasks.map((t) => ({ ...t, completed: false })),
    },
    usage: result.usage,
  };
}

