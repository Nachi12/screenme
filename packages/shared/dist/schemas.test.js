import { describe, expect, it } from 'vitest';
import { AnalysisReportSchema, CreateAnalysisRequestSchema, SAMPLE_DEMONSTRATION_REPORT, } from './index.js';
describe('@screenme/shared schemas', () => {
    it('validates the demonstration sample report against AnalysisReportSchema', () => {
        const parsed = AnalysisReportSchema.parse(SAMPLE_DEMONSTRATION_REPORT);
        expect(parsed.isSample).toBe(true);
        expect(parsed.sampleLabel).toBe('Demonstration Report');
        expect(parsed.jobMatch.requirements.length).toBeGreaterThan(0);
    });
    it('rejects too-short job descriptions in CreateAnalysisRequestSchema', () => {
        const res = CreateAnalysisRequestSchema.safeParse({
            resumeId: 'res-123',
            jobDescription: { rawText: 'Need dev' },
            candidateProfile: {
                experienceLevel: 'fresher',
                hiringEnvironment: 'product_based',
            },
        });
        expect(res.success).toBe(false);
    });
});
//# sourceMappingURL=schemas.test.js.map