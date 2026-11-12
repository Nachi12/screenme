import { SKILL_TAXONOMY } from '@screenme/shared';

interface CompiledAlias {
  canonical: string;
  alias: string;
  regex: RegExp;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildBoundaryRegex(term: string): RegExp {
  const escaped = escapeRegExp(term);
  // Special handling for symbols like c++, c#, .js, ci/cd
  const startsWithWord = /^[a-zA-Z0-9]/.test(term);
  const endsWithWord = /[a-zA-Z0-9]$/.test(term);
  const prefix = startsWithWord ? '(?<![a-zA-Z0-9_+#.])' : '(?<!\\S)';
  const suffix = endsWithWord ? '(?![a-zA-Z0-9_+#])' : '(?!\\S)';
  return new RegExp(`${prefix}${escaped}${suffix}`, 'i');
}

// Sort longest aliases first so "react native" matches before "react", "javascript" before "java", "c++" before "c"
const COMPILED_ALIASES: CompiledAlias[] = SKILL_TAXONOMY.flatMap((entry) =>
  entry.aliases.map((alias) => ({
    canonical: entry.canonical,
    alias,
    regex: buildBoundaryRegex(alias),
  }))
).sort((a, b) => b.alias.length - a.alias.length);

const EXACT_LOOKUP = new Map<string, string>();
for (const entry of SKILL_TAXONOMY) {
  EXACT_LOOKUP.set(entry.canonical.toLowerCase(), entry.canonical);
  for (const alias of entry.aliases) {
    EXACT_LOOKUP.set(alias.toLowerCase(), entry.canonical);
  }
}

export function normalizeSkillName(rawSkill: string): string {
  const cleaned = rawSkill.trim();
  if (!cleaned) return cleaned;
  const direct = EXACT_LOOKUP.get(cleaned.toLowerCase());
  if (direct) return direct;
  return cleaned;
}

export interface ExtractedSkillMention {
  canonical: string;
  matchedTerms: string[];
}

export function extractSkillsFromText(text: string): ExtractedSkillMention[] {
  if (!text.trim()) return [];

  // Mask matched spans from longest-first pass so "React Native" isn't also counted as "React"
  // and "JavaScript" isn't counted as "Java", and "GitHub" isn't counted as "Git"
  let workingText = text;
  const found = new Map<string, Set<string>>();

  for (const item of COMPILED_ALIASES) {
    const globalRegex = new RegExp(item.regex.source, 'gi');
    const matches = workingText.match(globalRegex);
    if (matches && matches.length > 0) {
      let set = found.get(item.canonical);
      if (!set) {
        set = new Set<string>();
        found.set(item.canonical, set);
      }
      for (const m of matches) {
        set.add(m);
      }
      workingText = workingText.replace(globalRegex, (matched) => ' '.repeat(matched.length));
    }
  }

  return Array.from(found.entries()).map(([canonical, terms]) => ({
    canonical,
    matchedTerms: Array.from(terms),
  }));
}

export function isKnownTaxonomySkill(skill: string): boolean {
  return EXACT_LOOKUP.has(skill.trim().toLowerCase());
}

export function areSkillsEquivalent(a: string, b: string): boolean {
  return normalizeSkillName(a).toLowerCase() === normalizeSkillName(b).toLowerCase();
}

