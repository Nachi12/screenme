import crypto from 'node:crypto';
import type {
  HiringEnvironment,
  JDRequirementItem,
  ParsedJD,
  RequirementCategory,
  RequirementImportance,
} from '@screenme/shared';
import { SKILL_TAXONOMY } from '@screenme/shared';
import { extractSkillsFromText } from './skillNormalizer.service.js';

const SOFT_SKILL_NAMES = new Set(
  SKILL_TAXONOMY.filter((s) => s.category === 'soft_skill').map((s) => s.canonical)
);

const PREFERRED_MARKERS =
  /\b(preferred|nice to have|good to have|bonus|plus|desirable|optional|familiarity with|exposure to)\b/i;
const MUST_HAVE_MARKERS =
  /\b(must|required|mandatory|essential|proficient|hands-on|strong knowledge|minimum|experience with|proficiency in)\b/i;

function detectEnvironment(rawText: string): HiringEnvironment {
  const lower = rawText.toLowerCase();
  if (/\bintern(?:ship)?\b|\bstipend\b/.test(lower)) return 'internship';
  if (/\bstartup\b|\bfast-paced\b|\bseed\b|\bearly-stage\b/.test(lower)) return 'startup';
  if (/\btcs\b|\binfosys\b|\bwipro\b|\bcognizant\b|\baccenture\b|\bservice-based\b|\bclient delivery\b/.test(lower)) {
    return 'it_services';
  }
  if (/\benterprise\b|\bfortune 500\b|\bglobal bank\b|\bcompliance\b/.test(lower)) {
    return 'enterprise';
  }
  return 'product_based';
}

function inferTitleAndCompany(
  rawText: string,
  providedTitle?: string,
  providedCompany?: string
): { title: string; company: string } {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let title = providedTitle?.trim() || '';
  let company = providedCompany?.trim() || '';

  if (!title) {
    const titleLine = lines.find((l) => /^(?:job\s*title|role|position)\s*:/i.test(l));
    if (titleLine) {
      title = titleLine.replace(/^(?:job\s*title|role|position)\s*:/i, '').trim();
    } else if (lines[0] && lines[0].length <= 80) {
      title = lines[0];
    } else {
      title = 'Software Engineer';
    }
  }

  if (!company) {
    const companyLine = lines.find((l) => /^(?:company|organization)\s*:/i.test(l));
    if (companyLine) {
      company = companyLine.replace(/^(?:company|organization)\s*:/i, '').trim();
    } else {
      company = 'Target Company';
    }
  }

  return { title, company };
}

function classifyClauseImportance(clause: string, sectionContext: 'preferred' | 'required' | 'neutral'): RequirementImportance {
  if (PREFERRED_MARKERS.test(clause) || sectionContext === 'preferred') {
    return 'preferred';
  }
  if (MUST_HAVE_MARKERS.test(clause) || sectionContext === 'required') {
    return 'must_have';
  }
  return 'contextual';
}

function inferCategory(clause: string, importance: RequirementImportance, canonicalSkill?: string): RequirementCategory {
  if (importance === 'preferred') return 'preferredSkills';
  if (/\b(b\.?tech|b\.?e\.?|degree|computer science|cgpa|graduate|bachelor|master|mca)\b/i.test(clause)) {
    return 'educationAndEligibility';
  }
  if (/\b(build|design|maintain|collaborate|write|develop|deploy|debug|review|deliver|responsibilit)\b/i.test(clause) && !canonicalSkill) {
    return 'coreResponsibilities';
  }
  if (/\b(project|internship|years? of experience|production|hands-on)\b/i.test(clause) && !canonicalSkill) {
    return 'projectsAndExperience';
  }
  if (canonicalSkill && SOFT_SKILL_NAMES.has(canonicalSkill)) {
    return 'coreResponsibilities';
  }
  return 'mandatoryTechnical';
}

export function parseJobDescription(params: {
  rawText: string;
  title?: string;
  company?: string;
}): { parsed: ParsedJD; jdHash: string } {
  const rawText = params.rawText.trim();
  const { title, company } = inferTitleAndCompany(
    rawText,
    params.title,
    params.company
  );

  const allSkills = extractSkillsFromText(rawText);
  const technicalSkills = allSkills
    .filter((s) => !SOFT_SKILL_NAMES.has(s.canonical))
    .map((s) => s.canonical);
  const softSkills = allSkills
    .filter((s) => SOFT_SKILL_NAMES.has(s.canonical))
    .map((s) => s.canonical);

  const expMatch = rawText.match(/\b(\d+\s*[-–to]+\s*\d+\s*years?|\d+\+?\s*years?|fresher|0\s*[-–]\s*1\s*year)\b/i);
  const eduMatch = rawText.match(/(?:b\.?tech|b\.?e\.?|bachelor'?s|mca|computer science)[^.\n]{0,80}/i);

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let sectionContext: 'preferred' | 'required' | 'neutral' = 'neutral';
  const requirements: JDRequirementItem[] = [];
  const responsibilities: string[] = [];
  const coveredSkills = new Set<string>();
  let reqCounter = 1;

  for (const line of lines) {
    if (/^(?:preferred|nice to have|bonus|good to have)/i.test(line)) {
      sectionContext = 'preferred';
    } else if (/^(?:required|requirements|must have|mandatory|qualifications)/i.test(line)) {
      sectionContext = 'required';
    } else if (/^(?:responsibilities|what you'll do|role overview)/i.test(line)) {
      sectionContext = 'neutral';
    }

    const cleanedLine = line.replace(/^[•*\-\d.)]+\s*/, '').trim();
    if (cleanedLine.length < 15) continue;

    if (/^(?:build|design|develop|maintain|implement|write|collaborate|optimize|test|deploy)/i.test(cleanedLine)) {
      responsibilities.push(cleanedLine);
    }

    // Split sentence on "preferred" clauses so e.g. "Experience with React, Node.js, and knowledge of AWS preferred"
    // accurately splits preferred skills from must-have skills
    const clauses = cleanedLine
      .split(/(?<=[.;])\s+|,\s+(?=and\s+(?:knowledge|exposure|familiarity|experience)\s+of\b)/i)
      .map((c) => c.trim())
      .filter((c) => c.length >= 10);

    for (const clause of clauses) {
      const clauseSkills = extractSkillsFromText(clause);
      const importance = classifyClauseImportance(clause, sectionContext);

      if (clauseSkills.length > 0) {
        for (const sk of clauseSkills) {
          if (coveredSkills.has(sk.canonical)) continue;
          coveredSkills.add(sk.canonical);
          const category = inferCategory(clause, importance, sk.canonical);
          requirements.push({
            id: `jd-req-${reqCounter++}`,
            text: `${sk.canonical} (${importance === 'preferred' ? 'Preferred' : 'Required'})`,
            canonicalSkill: sk.canonical,
            importance,
            category,
            sourceExcerpt: cleanedLine.slice(0, 260),
          });
        }
      } else if (
        /\b(b\.?tech|b\.?e\.?|degree|cgpa|graduate|test|api|project|internship|architecture)\b/i.test(
          clause
        ) &&
        requirements.length < 18
      ) {
        const category = inferCategory(clause, importance);
        requirements.push({
          id: `jd-req-${reqCounter++}`,
          text: clause.slice(0, 140),
          importance,
          category,
          sourceExcerpt: cleanedLine.slice(0, 260),
        });
      }
    }
  }

  // Ensure every extracted technical skill is represented if missed by line splitting
  for (const skill of technicalSkills) {
    if (!coveredSkills.has(skill)) {
      requirements.push({
        id: `jd-req-${reqCounter++}`,
        text: `${skill} proficiency`,
        canonicalSkill: skill,
        importance: 'must_have',
        category: 'mandatoryTechnical',
        sourceExcerpt: rawText.slice(0, 220),
      });
      coveredSkills.add(skill);
    }
  }

  const jdHash = crypto
    .createHash('sha256')
    .update(`${title.toLowerCase()}::${company.toLowerCase()}::${rawText}`)
    .digest('hex');

  return {
    jdHash,
    parsed: {
      title,
      company,
      experienceRequirement: expMatch?.[0],
      educationRequirement: eduMatch?.[0]?.trim(),
      detectedEnvironment: detectEnvironment(rawText),
      technicalSkills,
      softSkills,
      responsibilities: responsibilities.slice(0, 8),
      requirements: requirements.slice(0, 20),
      rawText,
    },
  };
}

