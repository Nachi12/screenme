import { describe, expect, it } from 'vitest';
import {
  areSkillsEquivalent,
  extractSkillsFromText,
  normalizeSkillName,
} from '../../services/parsing/skillNormalizer.service.js';

describe('skillNormalizer.service', () => {
  it('normalizes canonical aliases accurately', () => {
    expect(normalizeSkillName('React.js')).toBe('React');
    expect(normalizeSkillName('Node')).toBe('Node.js');
    expect(normalizeSkillName('Postgres')).toBe('PostgreSQL');
    expect(normalizeSkillName('js')).toBe('JavaScript');
    expect(areSkillsEquivalent('React.js', 'React')).toBe(true);
    expect(areSkillsEquivalent('Postgres', 'PostgreSQL')).toBe(true);
  });

  it('never conflates distinct technologies', () => {
    expect(areSkillsEquivalent('Java', 'JavaScript')).toBe(false);
    expect(areSkillsEquivalent('React', 'React Native')).toBe(false);
    expect(areSkillsEquivalent('MongoDB', 'SQL')).toBe(false);
    expect(areSkillsEquivalent('Git', 'GitHub')).toBe(false);

    const jsOnly = extractSkillsFromText('Built SPA with JavaScript and React Native, pushed to GitHub.');
    const names = jsOnly.map((s) => s.canonical);
    expect(names).toContain('JavaScript');
    expect(names).not.toContain('Java');
    expect(names).toContain('React Native');
    expect(names).not.toContain('React');
    expect(names).toContain('GitHub');
    expect(names).not.toContain('Git');
  });
});

