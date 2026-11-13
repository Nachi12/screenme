export interface SkillTaxonomyEntry {
    canonical: string;
    category: 'language' | 'framework' | 'database' | 'cloud' | 'tool' | 'concept' | 'soft_skill';
    aliases: string[];
}
export declare const SKILL_TAXONOMY: SkillTaxonomyEntry[];
/**
 * Explicit non-equivalent pairs that must NEVER be conflated.
 */
export declare const NON_EQUIVALENT_SKILL_PAIRS: ReadonlyArray<readonly [string, string]>;
//# sourceMappingURL=skills.d.ts.map