import { z } from 'zod';
import {
  EvidenceStatusSchema,
  type CandidateProfileInput,
  type ParsedJD,
  type ParsedResume,
  type RequirementMatch,
  type SkillAnalysis,
  type SkillGapItem,
  SkillGapItemSchema,
} from '@screenme/shared';
import { getAIProvider, type AIUsageMetrics } from '../ai/aiProvider.service.js';
import { CORE_SAFETY_SYSTEM_RULES, sanitizeUntrustedText } from '../ai/promptSafety.js';
import {
  areSkillsEquivalent,
  extractSkillsFromText,
  isKnownTaxonomySkill,
} from '../parsing/skillNormalizer.service.js';

const AIRequirementMatchOutputSchema = z.object({
  summary: z.string(),
  matches: z.array(
    z.object({
      requirementId: z.string(),
      status: EvidenceStatusSchema,
      resumeEvidenceSnippet: z.string().nullable(),
      resumeSection: z.string().nullable(),
      explanation: z.string(),
      suggestedAction: z.string(),
    })
  ),
  skillGaps: z.array(SkillGapItemSchema),
});

export interface JobMatchAIResult {
  summary: string;
  requirements: RequirementMatch[];
  skillAnalysis: SkillAnalysis;
  usage: AIUsageMetrics;
  provider: string;
  modelId: string;
}

function hasPracticalEvidenceInResume(resume: ParsedResume, skill: string): boolean {
  const practicalSections = resume.sections.filter((s) =>
    ['projects', 'internships', 'experience', 'achievements'].includes(s.type)
  );
  const textToCheck =
    practicalSections.length > 0
      ? practicalSections.map((s) => s.content).join('\n')
      : '';
  if (!textToCheck) return false;

  if (isKnownTaxonomySkill(skill)) {
    const extracted = extractSkillsFromText(textToCheck);
    return extracted.some((s) => areSkillsEquivalent(s.canonical, skill));
  }

  const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<![a-zA-Z0-9])${escaped}(?![a-zA-Z0-9])`, 'i').test(textToCheck);
}

export async function matchJobRequirements(params: {
  resume: ParsedResume;
  jd: ParsedJD;
  profile: CandidateProfileInput;
}): Promise<JobMatchAIResult> {
  const { resume, jd, profile } = params;
  const provider = getAIProvider();

  const requirementsPayload = jd.requirements.map((r) => ({
    id: r.id,
    requirement: r.text,
    canonicalSkill: r.canonicalSkill ?? null,
    importance: r.importance,
    category: r.category,
    jdSourceSnippet: r.sourceExcerpt,
  }));

  const userPrompt = `
Candidate Profile:
- Experience Level: ${profile.experienceLevel}
- Hiring Environment: ${profile.hiringEnvironment}
- Target Role: ${profile.targetRole || jd.title}
- Detected Skills in Resume: ${resume.detectedSkills.join(', ') || 'None detected'}

Requirements to Evaluate (JSON):
${JSON.stringify(requirementsPayload, null, 2)}

<UNTRUSTED_JD_TEXT>
${sanitizeUntrustedText(jd.rawText, 9000)}
</UNTRUSTED_JD_TEXT>

<UNTRUSTED_RESUME_TEXT>
${sanitizeUntrustedText(resume.rawText, 12000)}
</UNTRUSTED_RESUME_TEXT>

Return JSON with:
- "summary": 2-3 sentence evidence-based overview of alignment and key gaps (no arbitrary numerical score).
- "matches": array matching EVERY requirementId from the input list with:
  - "requirementId"
  - "status": one of "explicitly_demonstrated" | "partially_demonstrated" | "mentioned_without_evidence" | "not_found" | "unable_to_determine"
  - "resumeEvidenceSnippet": exact quote from resume or null if not found
  - "resumeSection": section heading where found or null
  - "explanation": clear explanation referencing concrete resume vs JD evidence
  - "suggestedAction": actionable, honest next step (never suggest adding skills they did not use)
- "skillGaps": array of missing/partial/visibility gap items with fields:
  - "skill", "group" ("critical_gaps" | "important_gaps" | "optional_improvements" | "visibility_gaps"), "priority" ("high" | "medium" | "low"), "whyItMatters", "jdEvidence", "resumeEvidence" (nullable), "suggestedNextAction"
`.trim();

  const result = await provider.generateStructured({
    systemInstruction: `${CORE_SAFETY_SYSTEM_RULES}
You are an experienced technical recruiter and engineering mentor evaluating resume evidence against job requirements.
For students/freshers, academic projects, personal projects, internships, hackathons, and open-source contributions count as practical evidence.`,
    userPrompt,
    schema: AIRequirementMatchOutputSchema,
  });

  const matchById = new Map(result.data.matches.map((m) => [m.requirementId, m]));

  const requirements: RequirementMatch[] = jd.requirements.map((jdReq) => {
    const aiMatch = matchById.get(jdReq.id);
    let status = aiMatch?.status ?? 'unable_to_determine';
    const resumeSection = aiMatch?.resumeSection ?? null;

    // Deterministic guardrail: a skill listed only in Skills without project/work proof
    // cannot be marked explicitly_demonstrated
    if (
      status === 'explicitly_demonstrated' &&
      jdReq.canonicalSkill &&
      resumeSection?.toLowerCase().includes('skill') &&
      !hasPracticalEvidenceInResume(resume, jdReq.canonicalSkill)
    ) {
      status = 'mentioned_without_evidence';
    }

    return {
      requirementId: jdReq.id,
      requirement: jdReq.text,
      canonicalSkill: jdReq.canonicalSkill,
      importance: jdReq.importance,
      category: jdReq.category,
      status,
      jdSourceSnippet: jdReq.sourceExcerpt,
      resumeEvidenceSnippet: aiMatch?.resumeEvidenceSnippet ?? null,
      resumeSection,
      explanation:
        aiMatch?.explanation ??
        'Insufficient structured evidence returned to evaluate this requirement.',
      suggestedAction:
        aiMatch?.suggestedAction ??
        'Review this requirement and add concrete project evidence if you have used it.',
    };
  });

  // Derive consistent skill buckets from validated requirements + resume skills
  const demonstrated: string[] = [];
  const partial: string[] = [];
  const mentionedOnly: string[] = [];

  for (const req of requirements) {
    const label = req.canonicalSkill ?? req.requirement;
    if (req.status === 'explicitly_demonstrated' && !demonstrated.includes(label)) {
      demonstrated.push(label);
    } else if (req.status === 'partially_demonstrated' && !partial.includes(label)) {
      partial.push(label);
    } else if (req.status === 'mentioned_without_evidence' && !mentionedOnly.includes(label)) {
      mentionedOnly.push(label);
    }
  }

  for (const resSkill of resume.detectedSkills) {
    const alreadyClassified = [...demonstrated, ...partial, ...mentionedOnly].some((s) =>
      areSkillsEquivalent(s, resSkill)
    );
    if (!alreadyClassified) {
      if (hasPracticalEvidenceInResume(resume, resSkill)) {
        demonstrated.push(resSkill);
      } else {
        mentionedOnly.push(resSkill);
      }
    }
  }

  const missing: SkillGapItem[] = result.data.skillGaps;

  return {
    summary: result.data.summary,
    requirements,
    skillAnalysis: {
      demonstrated,
      partial,
      mentionedOnly,
      missing,
    },
    usage: result.usage,
    provider: result.provider,
    modelId: result.modelId,
  };
}

