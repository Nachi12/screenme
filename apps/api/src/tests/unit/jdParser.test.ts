import { describe, expect, it } from 'vitest';
import { parseJobDescription } from '../../services/parsing/jdParser.service.js';

describe('jdParser.service', () => {
  it('separates must-have requirements from preferred skills accurately', () => {
    const { parsed } = parseJobDescription({
      rawText:
        'Experience with React, Node.js, REST APIs, Git, and knowledge of AWS preferred.',
    });

    const reqBySkill = new Map(
      parsed.requirements
        .filter((r) => r.canonicalSkill)
        .map((r) => [r.canonicalSkill!, r.importance])
    );

    expect(reqBySkill.get('React')).toBe('must_have');
    expect(reqBySkill.get('Node.js')).toBe('must_have');
    expect(reqBySkill.get('REST APIs')).toBe('must_have');
    expect(reqBySkill.get('Git')).toBe('must_have');
    expect(reqBySkill.get('AWS')).toBe('preferred');
  });
});

