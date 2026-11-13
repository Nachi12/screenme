import { z } from 'zod';
export declare const ExperienceLevelSchema: z.ZodEnum<["student", "fresher", "0_1_year", "1_3_years", "3_plus_years"]>;
export type ExperienceLevel = z.infer<typeof ExperienceLevelSchema>;
export declare const HiringEnvironmentSchema: z.ZodEnum<["it_services", "product_based", "startup", "enterprise", "internship", "auto_detect"]>;
export type HiringEnvironment = z.infer<typeof HiringEnvironmentSchema>;
export declare const EvidenceStatusSchema: z.ZodEnum<["explicitly_demonstrated", "partially_demonstrated", "mentioned_without_evidence", "not_found", "unable_to_determine"]>;
export type EvidenceStatus = z.infer<typeof EvidenceStatusSchema>;
export declare const RequirementImportanceSchema: z.ZodEnum<["must_have", "preferred", "contextual", "unclear"]>;
export type RequirementImportance = z.infer<typeof RequirementImportanceSchema>;
export declare const RequirementCategorySchema: z.ZodEnum<["mandatoryTechnical", "projectsAndExperience", "coreResponsibilities", "educationAndEligibility", "preferredSkills"]>;
export type RequirementCategory = z.infer<typeof RequirementCategorySchema>;
export declare const HRVerdictSchema: z.ZodEnum<["Strong Match", "Potential Match", "Needs Improvement", "Significant Gaps"]>;
export type HRVerdict = z.infer<typeof HRVerdictSchema>;
export declare const ATSCheckStatusSchema: z.ZodEnum<["passed", "failed", "warning", "not_evaluated"]>;
export type ATSCheckStatus = z.infer<typeof ATSCheckStatusSchema>;
export declare const ResumeSectionTypeSchema: z.ZodEnum<["header", "summary", "education", "skills", "projects", "internships", "experience", "certifications", "achievements", "other"]>;
export type ResumeSectionType = z.infer<typeof ResumeSectionTypeSchema>;
export declare const ResumeSectionSnippetSchema: z.ZodObject<{
    type: z.ZodEnum<["header", "summary", "education", "skills", "projects", "internships", "experience", "certifications", "achievements", "other"]>;
    heading: z.ZodString;
    content: z.ZodString;
    pageNumber: z.ZodOptional<z.ZodNumber>;
    startLine: z.ZodOptional<z.ZodNumber>;
    endLine: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "header" | "summary" | "education" | "skills" | "projects" | "internships" | "experience" | "certifications" | "achievements" | "other";
    heading: string;
    content: string;
    pageNumber?: number | undefined;
    startLine?: number | undefined;
    endLine?: number | undefined;
}, {
    type: "header" | "summary" | "education" | "skills" | "projects" | "internships" | "experience" | "certifications" | "achievements" | "other";
    heading: string;
    content: string;
    pageNumber?: number | undefined;
    startLine?: number | undefined;
    endLine?: number | undefined;
}>;
export type ResumeSectionSnippet = z.infer<typeof ResumeSectionSnippetSchema>;
export declare const ParsedResumeSchema: z.ZodObject<{
    candidateName: z.ZodOptional<z.ZodString>;
    contact: z.ZodObject<{
        email: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        linkedin: z.ZodOptional<z.ZodString>;
        github: z.ZodOptional<z.ZodString>;
        portfolio: z.ZodOptional<z.ZodString>;
        location: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        github?: string | undefined;
        email?: string | undefined;
        phone?: string | undefined;
        linkedin?: string | undefined;
        portfolio?: string | undefined;
        location?: string | undefined;
    }, {
        github?: string | undefined;
        email?: string | undefined;
        phone?: string | undefined;
        linkedin?: string | undefined;
        portfolio?: string | undefined;
        location?: string | undefined;
    }>;
    fileName: z.ZodString;
    fileType: z.ZodEnum<["pdf", "docx"]>;
    fileSizeBytes: z.ZodNumber;
    pageCount: z.ZodNumber;
    wordCount: z.ZodNumber;
    rawText: z.ZodString;
    sections: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["header", "summary", "education", "skills", "projects", "internships", "experience", "certifications", "achievements", "other"]>;
        heading: z.ZodString;
        content: z.ZodString;
        pageNumber: z.ZodOptional<z.ZodNumber>;
        startLine: z.ZodOptional<z.ZodNumber>;
        endLine: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: "header" | "summary" | "education" | "skills" | "projects" | "internships" | "experience" | "certifications" | "achievements" | "other";
        heading: string;
        content: string;
        pageNumber?: number | undefined;
        startLine?: number | undefined;
        endLine?: number | undefined;
    }, {
        type: "header" | "summary" | "education" | "skills" | "projects" | "internships" | "experience" | "certifications" | "achievements" | "other";
        heading: string;
        content: string;
        pageNumber?: number | undefined;
        startLine?: number | undefined;
        endLine?: number | undefined;
    }>, "many">;
    detectedSkills: z.ZodArray<z.ZodString, "many">;
    extractionWarnings: z.ZodArray<z.ZodString, "many">;
    readingOrderConfidence: z.ZodEnum<["high", "medium", "low", "unable_to_determine"]>;
}, "strip", z.ZodTypeAny, {
    contact: {
        github?: string | undefined;
        email?: string | undefined;
        phone?: string | undefined;
        linkedin?: string | undefined;
        portfolio?: string | undefined;
        location?: string | undefined;
    };
    fileName: string;
    fileType: "pdf" | "docx";
    fileSizeBytes: number;
    pageCount: number;
    wordCount: number;
    rawText: string;
    sections: {
        type: "header" | "summary" | "education" | "skills" | "projects" | "internships" | "experience" | "certifications" | "achievements" | "other";
        heading: string;
        content: string;
        pageNumber?: number | undefined;
        startLine?: number | undefined;
        endLine?: number | undefined;
    }[];
    detectedSkills: string[];
    extractionWarnings: string[];
    readingOrderConfidence: "unable_to_determine" | "high" | "medium" | "low";
    candidateName?: string | undefined;
}, {
    contact: {
        github?: string | undefined;
        email?: string | undefined;
        phone?: string | undefined;
        linkedin?: string | undefined;
        portfolio?: string | undefined;
        location?: string | undefined;
    };
    fileName: string;
    fileType: "pdf" | "docx";
    fileSizeBytes: number;
    pageCount: number;
    wordCount: number;
    rawText: string;
    sections: {
        type: "header" | "summary" | "education" | "skills" | "projects" | "internships" | "experience" | "certifications" | "achievements" | "other";
        heading: string;
        content: string;
        pageNumber?: number | undefined;
        startLine?: number | undefined;
        endLine?: number | undefined;
    }[];
    detectedSkills: string[];
    extractionWarnings: string[];
    readingOrderConfidence: "unable_to_determine" | "high" | "medium" | "low";
    candidateName?: string | undefined;
}>;
export type ParsedResume = z.infer<typeof ParsedResumeSchema>;
export declare const JDRequirementItemSchema: z.ZodObject<{
    id: z.ZodString;
    text: z.ZodString;
    canonicalSkill: z.ZodOptional<z.ZodString>;
    importance: z.ZodEnum<["must_have", "preferred", "contextual", "unclear"]>;
    category: z.ZodEnum<["mandatoryTechnical", "projectsAndExperience", "coreResponsibilities", "educationAndEligibility", "preferredSkills"]>;
    sourceExcerpt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    text: string;
    importance: "must_have" | "preferred" | "contextual" | "unclear";
    category: "mandatoryTechnical" | "projectsAndExperience" | "coreResponsibilities" | "educationAndEligibility" | "preferredSkills";
    sourceExcerpt: string;
    canonicalSkill?: string | undefined;
}, {
    id: string;
    text: string;
    importance: "must_have" | "preferred" | "contextual" | "unclear";
    category: "mandatoryTechnical" | "projectsAndExperience" | "coreResponsibilities" | "educationAndEligibility" | "preferredSkills";
    sourceExcerpt: string;
    canonicalSkill?: string | undefined;
}>;
export type JDRequirementItem = z.infer<typeof JDRequirementItemSchema>;
export declare const ParsedJDSchema: z.ZodObject<{
    title: z.ZodString;
    company: z.ZodString;
    experienceRequirement: z.ZodOptional<z.ZodString>;
    educationRequirement: z.ZodOptional<z.ZodString>;
    detectedEnvironment: z.ZodOptional<z.ZodEnum<["it_services", "product_based", "startup", "enterprise", "internship", "auto_detect"]>>;
    technicalSkills: z.ZodArray<z.ZodString, "many">;
    softSkills: z.ZodArray<z.ZodString, "many">;
    responsibilities: z.ZodArray<z.ZodString, "many">;
    requirements: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        text: z.ZodString;
        canonicalSkill: z.ZodOptional<z.ZodString>;
        importance: z.ZodEnum<["must_have", "preferred", "contextual", "unclear"]>;
        category: z.ZodEnum<["mandatoryTechnical", "projectsAndExperience", "coreResponsibilities", "educationAndEligibility", "preferredSkills"]>;
        sourceExcerpt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        text: string;
        importance: "must_have" | "preferred" | "contextual" | "unclear";
        category: "mandatoryTechnical" | "projectsAndExperience" | "coreResponsibilities" | "educationAndEligibility" | "preferredSkills";
        sourceExcerpt: string;
        canonicalSkill?: string | undefined;
    }, {
        id: string;
        text: string;
        importance: "must_have" | "preferred" | "contextual" | "unclear";
        category: "mandatoryTechnical" | "projectsAndExperience" | "coreResponsibilities" | "educationAndEligibility" | "preferredSkills";
        sourceExcerpt: string;
        canonicalSkill?: string | undefined;
    }>, "many">;
    rawText: z.ZodString;
}, "strip", z.ZodTypeAny, {
    rawText: string;
    title: string;
    company: string;
    technicalSkills: string[];
    softSkills: string[];
    responsibilities: string[];
    requirements: {
        id: string;
        text: string;
        importance: "must_have" | "preferred" | "contextual" | "unclear";
        category: "mandatoryTechnical" | "projectsAndExperience" | "coreResponsibilities" | "educationAndEligibility" | "preferredSkills";
        sourceExcerpt: string;
        canonicalSkill?: string | undefined;
    }[];
    experienceRequirement?: string | undefined;
    educationRequirement?: string | undefined;
    detectedEnvironment?: "it_services" | "product_based" | "startup" | "enterprise" | "internship" | "auto_detect" | undefined;
}, {
    rawText: string;
    title: string;
    company: string;
    technicalSkills: string[];
    softSkills: string[];
    responsibilities: string[];
    requirements: {
        id: string;
        text: string;
        importance: "must_have" | "preferred" | "contextual" | "unclear";
        category: "mandatoryTechnical" | "projectsAndExperience" | "coreResponsibilities" | "educationAndEligibility" | "preferredSkills";
        sourceExcerpt: string;
        canonicalSkill?: string | undefined;
    }[];
    experienceRequirement?: string | undefined;
    educationRequirement?: string | undefined;
    detectedEnvironment?: "it_services" | "product_based" | "startup" | "enterprise" | "internship" | "auto_detect" | undefined;
}>;
export type ParsedJD = z.infer<typeof ParsedJDSchema>;
export declare const ATSCheckItemSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    status: z.ZodEnum<["passed", "failed", "warning", "not_evaluated"]>;
    score: z.ZodNumber;
    maxScore: z.ZodNumber;
    explanation: z.ZodString;
    recommendation: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "passed" | "failed" | "warning" | "not_evaluated";
    id: string;
    name: string;
    score: number;
    maxScore: number;
    explanation: string;
    recommendation?: string | undefined;
}, {
    status: "passed" | "failed" | "warning" | "not_evaluated";
    id: string;
    name: string;
    score: number;
    maxScore: number;
    explanation: string;
    recommendation?: string | undefined;
}>;
export type ATSCheckItem = z.infer<typeof ATSCheckItemSchema>;
export declare const ATSEvaluationSchema: z.ZodObject<{
    score: z.ZodNumber;
    disclaimer: z.ZodString;
    checks: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        status: z.ZodEnum<["passed", "failed", "warning", "not_evaluated"]>;
        score: z.ZodNumber;
        maxScore: z.ZodNumber;
        explanation: z.ZodString;
        recommendation: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: "passed" | "failed" | "warning" | "not_evaluated";
        id: string;
        name: string;
        score: number;
        maxScore: number;
        explanation: string;
        recommendation?: string | undefined;
    }, {
        status: "passed" | "failed" | "warning" | "not_evaluated";
        id: string;
        name: string;
        score: number;
        maxScore: number;
        explanation: string;
        recommendation?: string | undefined;
    }>, "many">;
    passedCount: z.ZodNumber;
    failedCount: z.ZodNumber;
    warningCount: z.ZodNumber;
    notEvaluatedCount: z.ZodNumber;
    recommendedFixes: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    score: number;
    disclaimer: string;
    checks: {
        status: "passed" | "failed" | "warning" | "not_evaluated";
        id: string;
        name: string;
        score: number;
        maxScore: number;
        explanation: string;
        recommendation?: string | undefined;
    }[];
    passedCount: number;
    failedCount: number;
    warningCount: number;
    notEvaluatedCount: number;
    recommendedFixes: string[];
}, {
    score: number;
    disclaimer: string;
    checks: {
        status: "passed" | "failed" | "warning" | "not_evaluated";
        id: string;
        name: string;
        score: number;
        maxScore: number;
        explanation: string;
        recommendation?: string | undefined;
    }[];
    passedCount: number;
    failedCount: number;
    warningCount: number;
    notEvaluatedCount: number;
    recommendedFixes: string[];
}>;
export type ATSEvaluation = z.infer<typeof ATSEvaluationSchema>;
export declare const RequirementMatchSchema: z.ZodObject<{
    requirementId: z.ZodString;
    requirement: z.ZodString;
    canonicalSkill: z.ZodOptional<z.ZodString>;
    importance: z.ZodEnum<["must_have", "preferred", "contextual", "unclear"]>;
    category: z.ZodEnum<["mandatoryTechnical", "projectsAndExperience", "coreResponsibilities", "educationAndEligibility", "preferredSkills"]>;
    status: z.ZodEnum<["explicitly_demonstrated", "partially_demonstrated", "mentioned_without_evidence", "not_found", "unable_to_determine"]>;
    jdSourceSnippet: z.ZodString;
    resumeEvidenceSnippet: z.ZodNullable<z.ZodString>;
    resumeSection: z.ZodNullable<z.ZodString>;
    explanation: z.ZodString;
    suggestedAction: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "explicitly_demonstrated" | "partially_demonstrated" | "mentioned_without_evidence" | "not_found" | "unable_to_determine";
    importance: "must_have" | "preferred" | "contextual" | "unclear";
    category: "mandatoryTechnical" | "projectsAndExperience" | "coreResponsibilities" | "educationAndEligibility" | "preferredSkills";
    explanation: string;
    requirementId: string;
    requirement: string;
    jdSourceSnippet: string;
    resumeEvidenceSnippet: string | null;
    resumeSection: string | null;
    suggestedAction: string;
    canonicalSkill?: string | undefined;
}, {
    status: "explicitly_demonstrated" | "partially_demonstrated" | "mentioned_without_evidence" | "not_found" | "unable_to_determine";
    importance: "must_have" | "preferred" | "contextual" | "unclear";
    category: "mandatoryTechnical" | "projectsAndExperience" | "coreResponsibilities" | "educationAndEligibility" | "preferredSkills";
    explanation: string;
    requirementId: string;
    requirement: string;
    jdSourceSnippet: string;
    resumeEvidenceSnippet: string | null;
    resumeSection: string | null;
    suggestedAction: string;
    canonicalSkill?: string | undefined;
}>;
export type RequirementMatch = z.infer<typeof RequirementMatchSchema>;
export declare const CategoryScoreBreakdownSchema: z.ZodObject<{
    category: z.ZodEnum<["mandatoryTechnical", "projectsAndExperience", "coreResponsibilities", "educationAndEligibility", "preferredSkills"]>;
    label: z.ZodString;
    baseWeight: z.ZodNumber;
    normalizedWeight: z.ZodNumber;
    score: z.ZodNullable<z.ZodNumber>;
    applicableCount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    category: "mandatoryTechnical" | "projectsAndExperience" | "coreResponsibilities" | "educationAndEligibility" | "preferredSkills";
    score: number | null;
    label: string;
    baseWeight: number;
    normalizedWeight: number;
    applicableCount: number;
}, {
    category: "mandatoryTechnical" | "projectsAndExperience" | "coreResponsibilities" | "educationAndEligibility" | "preferredSkills";
    score: number | null;
    label: string;
    baseWeight: number;
    normalizedWeight: number;
    applicableCount: number;
}>;
export type CategoryScoreBreakdown = z.infer<typeof CategoryScoreBreakdownSchema>;
export declare const JobMatchEvaluationSchema: z.ZodObject<{
    score: z.ZodNullable<z.ZodNumber>;
    confidence: z.ZodEnum<["high", "medium", "low"]>;
    disclaimer: z.ZodString;
    fresherModeApplied: z.ZodBoolean;
    summary: z.ZodString;
    categoryBreakdown: z.ZodArray<z.ZodObject<{
        category: z.ZodEnum<["mandatoryTechnical", "projectsAndExperience", "coreResponsibilities", "educationAndEligibility", "preferredSkills"]>;
        label: z.ZodString;
        baseWeight: z.ZodNumber;
        normalizedWeight: z.ZodNumber;
        score: z.ZodNullable<z.ZodNumber>;
        applicableCount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        category: "mandatoryTechnical" | "projectsAndExperience" | "coreResponsibilities" | "educationAndEligibility" | "preferredSkills";
        score: number | null;
        label: string;
        baseWeight: number;
        normalizedWeight: number;
        applicableCount: number;
    }, {
        category: "mandatoryTechnical" | "projectsAndExperience" | "coreResponsibilities" | "educationAndEligibility" | "preferredSkills";
        score: number | null;
        label: string;
        baseWeight: number;
        normalizedWeight: number;
        applicableCount: number;
    }>, "many">;
    requirements: z.ZodArray<z.ZodObject<{
        requirementId: z.ZodString;
        requirement: z.ZodString;
        canonicalSkill: z.ZodOptional<z.ZodString>;
        importance: z.ZodEnum<["must_have", "preferred", "contextual", "unclear"]>;
        category: z.ZodEnum<["mandatoryTechnical", "projectsAndExperience", "coreResponsibilities", "educationAndEligibility", "preferredSkills"]>;
        status: z.ZodEnum<["explicitly_demonstrated", "partially_demonstrated", "mentioned_without_evidence", "not_found", "unable_to_determine"]>;
        jdSourceSnippet: z.ZodString;
        resumeEvidenceSnippet: z.ZodNullable<z.ZodString>;
        resumeSection: z.ZodNullable<z.ZodString>;
        explanation: z.ZodString;
        suggestedAction: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        status: "explicitly_demonstrated" | "partially_demonstrated" | "mentioned_without_evidence" | "not_found" | "unable_to_determine";
        importance: "must_have" | "preferred" | "contextual" | "unclear";
        category: "mandatoryTechnical" | "projectsAndExperience" | "coreResponsibilities" | "educationAndEligibility" | "preferredSkills";
        explanation: string;
        requirementId: string;
        requirement: string;
        jdSourceSnippet: string;
        resumeEvidenceSnippet: string | null;
        resumeSection: string | null;
        suggestedAction: string;
        canonicalSkill?: string | undefined;
    }, {
        status: "explicitly_demonstrated" | "partially_demonstrated" | "mentioned_without_evidence" | "not_found" | "unable_to_determine";
        importance: "must_have" | "preferred" | "contextual" | "unclear";
        category: "mandatoryTechnical" | "projectsAndExperience" | "coreResponsibilities" | "educationAndEligibility" | "preferredSkills";
        explanation: string;
        requirementId: string;
        requirement: string;
        jdSourceSnippet: string;
        resumeEvidenceSnippet: string | null;
        resumeSection: string | null;
        suggestedAction: string;
        canonicalSkill?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    summary: string;
    requirements: {
        status: "explicitly_demonstrated" | "partially_demonstrated" | "mentioned_without_evidence" | "not_found" | "unable_to_determine";
        importance: "must_have" | "preferred" | "contextual" | "unclear";
        category: "mandatoryTechnical" | "projectsAndExperience" | "coreResponsibilities" | "educationAndEligibility" | "preferredSkills";
        explanation: string;
        requirementId: string;
        requirement: string;
        jdSourceSnippet: string;
        resumeEvidenceSnippet: string | null;
        resumeSection: string | null;
        suggestedAction: string;
        canonicalSkill?: string | undefined;
    }[];
    score: number | null;
    disclaimer: string;
    confidence: "high" | "medium" | "low";
    fresherModeApplied: boolean;
    categoryBreakdown: {
        category: "mandatoryTechnical" | "projectsAndExperience" | "coreResponsibilities" | "educationAndEligibility" | "preferredSkills";
        score: number | null;
        label: string;
        baseWeight: number;
        normalizedWeight: number;
        applicableCount: number;
    }[];
}, {
    summary: string;
    requirements: {
        status: "explicitly_demonstrated" | "partially_demonstrated" | "mentioned_without_evidence" | "not_found" | "unable_to_determine";
        importance: "must_have" | "preferred" | "contextual" | "unclear";
        category: "mandatoryTechnical" | "projectsAndExperience" | "coreResponsibilities" | "educationAndEligibility" | "preferredSkills";
        explanation: string;
        requirementId: string;
        requirement: string;
        jdSourceSnippet: string;
        resumeEvidenceSnippet: string | null;
        resumeSection: string | null;
        suggestedAction: string;
        canonicalSkill?: string | undefined;
    }[];
    score: number | null;
    disclaimer: string;
    confidence: "high" | "medium" | "low";
    fresherModeApplied: boolean;
    categoryBreakdown: {
        category: "mandatoryTechnical" | "projectsAndExperience" | "coreResponsibilities" | "educationAndEligibility" | "preferredSkills";
        score: number | null;
        label: string;
        baseWeight: number;
        normalizedWeight: number;
        applicableCount: number;
    }[];
}>;
export type JobMatchEvaluation = z.infer<typeof JobMatchEvaluationSchema>;
export declare const HREvaluationSchema: z.ZodObject<{
    verdict: z.ZodEnum<["Strong Match", "Potential Match", "Needs Improvement", "Significant Gaps"]>;
    screeningImpression: z.ZodString;
    reasoningSummary: z.ZodString;
    strengths: z.ZodArray<z.ZodString, "many">;
    concerns: z.ZodArray<z.ZodString, "many">;
    relevantEvidence: z.ZodArray<z.ZodString, "many">;
    missingEvidence: z.ZodArray<z.ZodString, "many">;
    improvementPriorities: z.ZodArray<z.ZodString, "many">;
    readinessGuidance: z.ZodString;
}, "strip", z.ZodTypeAny, {
    verdict: "Strong Match" | "Potential Match" | "Needs Improvement" | "Significant Gaps";
    screeningImpression: string;
    reasoningSummary: string;
    strengths: string[];
    concerns: string[];
    relevantEvidence: string[];
    missingEvidence: string[];
    improvementPriorities: string[];
    readinessGuidance: string;
}, {
    verdict: "Strong Match" | "Potential Match" | "Needs Improvement" | "Significant Gaps";
    screeningImpression: string;
    reasoningSummary: string;
    strengths: string[];
    concerns: string[];
    relevantEvidence: string[];
    missingEvidence: string[];
    improvementPriorities: string[];
    readinessGuidance: string;
}>;
export type HREvaluation = z.infer<typeof HREvaluationSchema>;
export declare const SkillGapItemSchema: z.ZodObject<{
    skill: z.ZodString;
    group: z.ZodEnum<["critical_gaps", "important_gaps", "optional_improvements", "visibility_gaps"]>;
    priority: z.ZodEnum<["high", "medium", "low"]>;
    whyItMatters: z.ZodString;
    jdEvidence: z.ZodString;
    resumeEvidence: z.ZodNullable<z.ZodString>;
    suggestedNextAction: z.ZodString;
}, "strip", z.ZodTypeAny, {
    skill: string;
    group: "critical_gaps" | "important_gaps" | "optional_improvements" | "visibility_gaps";
    priority: "high" | "medium" | "low";
    whyItMatters: string;
    jdEvidence: string;
    resumeEvidence: string | null;
    suggestedNextAction: string;
}, {
    skill: string;
    group: "critical_gaps" | "important_gaps" | "optional_improvements" | "visibility_gaps";
    priority: "high" | "medium" | "low";
    whyItMatters: string;
    jdEvidence: string;
    resumeEvidence: string | null;
    suggestedNextAction: string;
}>;
export type SkillGapItem = z.infer<typeof SkillGapItemSchema>;
export declare const SkillAnalysisSchema: z.ZodObject<{
    demonstrated: z.ZodArray<z.ZodString, "many">;
    partial: z.ZodArray<z.ZodString, "many">;
    mentionedOnly: z.ZodArray<z.ZodString, "many">;
    missing: z.ZodArray<z.ZodObject<{
        skill: z.ZodString;
        group: z.ZodEnum<["critical_gaps", "important_gaps", "optional_improvements", "visibility_gaps"]>;
        priority: z.ZodEnum<["high", "medium", "low"]>;
        whyItMatters: z.ZodString;
        jdEvidence: z.ZodString;
        resumeEvidence: z.ZodNullable<z.ZodString>;
        suggestedNextAction: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        skill: string;
        group: "critical_gaps" | "important_gaps" | "optional_improvements" | "visibility_gaps";
        priority: "high" | "medium" | "low";
        whyItMatters: string;
        jdEvidence: string;
        resumeEvidence: string | null;
        suggestedNextAction: string;
    }, {
        skill: string;
        group: "critical_gaps" | "important_gaps" | "optional_improvements" | "visibility_gaps";
        priority: "high" | "medium" | "low";
        whyItMatters: string;
        jdEvidence: string;
        resumeEvidence: string | null;
        suggestedNextAction: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    demonstrated: string[];
    partial: string[];
    mentionedOnly: string[];
    missing: {
        skill: string;
        group: "critical_gaps" | "important_gaps" | "optional_improvements" | "visibility_gaps";
        priority: "high" | "medium" | "low";
        whyItMatters: string;
        jdEvidence: string;
        resumeEvidence: string | null;
        suggestedNextAction: string;
    }[];
}, {
    demonstrated: string[];
    partial: string[];
    mentionedOnly: string[];
    missing: {
        skill: string;
        group: "critical_gaps" | "important_gaps" | "optional_improvements" | "visibility_gaps";
        priority: "high" | "medium" | "low";
        whyItMatters: string;
        jdEvidence: string;
        resumeEvidence: string | null;
        suggestedNextAction: string;
    }[];
}>;
export type SkillAnalysis = z.infer<typeof SkillAnalysisSchema>;
export declare const ProjectAnalysisItemSchema: z.ZodObject<{
    projectName: z.ZodString;
    relevanceToJD: z.ZodEnum<["high", "medium", "low"]>;
    technologiesDemonstrated: z.ZodArray<z.ZodString, "many">;
    technologiesMissingForJD: z.ZodArray<z.ZodString, "many">;
    strengths: z.ZodArray<z.ZodString, "many">;
    gaps: z.ZodArray<z.ZodString, "many">;
    complexityAssessment: z.ZodString;
    recommendedEnhancements: z.ZodArray<z.ZodString, "many">;
    sourceSnippet: z.ZodString;
}, "strip", z.ZodTypeAny, {
    strengths: string[];
    projectName: string;
    relevanceToJD: "high" | "medium" | "low";
    technologiesDemonstrated: string[];
    technologiesMissingForJD: string[];
    gaps: string[];
    complexityAssessment: string;
    recommendedEnhancements: string[];
    sourceSnippet: string;
}, {
    strengths: string[];
    projectName: string;
    relevanceToJD: "high" | "medium" | "low";
    technologiesDemonstrated: string[];
    technologiesMissingForJD: string[];
    gaps: string[];
    complexityAssessment: string;
    recommendedEnhancements: string[];
    sourceSnippet: string;
}>;
export type ProjectAnalysisItem = z.infer<typeof ProjectAnalysisItemSchema>;
export declare const RewriteSuggestionSchema: z.ZodObject<{
    id: z.ZodString;
    section: z.ZodString;
    originalText: z.ZodString;
    suggestedRewrite: z.ZodString;
    whyItIsBetter: z.ZodString;
    relevantJDSkills: z.ZodArray<z.ZodString, "many">;
    claimsRequiringVerification: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    section: string;
    originalText: string;
    suggestedRewrite: string;
    whyItIsBetter: string;
    relevantJDSkills: string[];
    claimsRequiringVerification: string[];
}, {
    id: string;
    section: string;
    originalText: string;
    suggestedRewrite: string;
    whyItIsBetter: string;
    relevantJDSkills: string[];
    claimsRequiringVerification: string[];
}>;
export type RewriteSuggestion = z.infer<typeof RewriteSuggestionSchema>;
export declare const RoadmapTaskSchema: z.ZodObject<{
    taskId: z.ZodString;
    week: z.ZodNumber;
    skill: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    priority: z.ZodEnum<["high", "medium", "low"]>;
    estimatedEffort: z.ZodString;
    supportingProjectSuggestion: z.ZodString;
    completed: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    title: string;
    skill: string;
    priority: "high" | "medium" | "low";
    taskId: string;
    week: number;
    description: string;
    estimatedEffort: string;
    supportingProjectSuggestion: string;
    completed: boolean;
}, {
    title: string;
    skill: string;
    priority: "high" | "medium" | "low";
    taskId: string;
    week: number;
    description: string;
    estimatedEffort: string;
    supportingProjectSuggestion: string;
    completed?: boolean | undefined;
}>;
export type RoadmapTask = z.infer<typeof RoadmapTaskSchema>;
export declare const InterviewQuestionSchema: z.ZodObject<{
    id: z.ZodString;
    category: z.ZodEnum<["technical", "project_based", "problem_solving", "behavioral", "missing_requirement"]>;
    question: z.ZodString;
    difficulty: z.ZodEnum<["foundational", "intermediate", "advanced"]>;
    skillTested: z.ZodString;
    whyInterviewerAsks: z.ZodString;
    suggestedAnswerFramework: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    category: "technical" | "project_based" | "problem_solving" | "behavioral" | "missing_requirement";
    question: string;
    difficulty: "foundational" | "intermediate" | "advanced";
    skillTested: string;
    whyInterviewerAsks: string;
    suggestedAnswerFramework: string;
}, {
    id: string;
    category: "technical" | "project_based" | "problem_solving" | "behavioral" | "missing_requirement";
    question: string;
    difficulty: "foundational" | "intermediate" | "advanced";
    skillTested: string;
    whyInterviewerAsks: string;
    suggestedAnswerFramework: string;
}>;
export type InterviewQuestion = z.infer<typeof InterviewQuestionSchema>;
export declare const CandidateProfileInputSchema: z.ZodObject<{
    experienceLevel: z.ZodEnum<["student", "fresher", "0_1_year", "1_3_years", "3_plus_years"]>;
    hiringEnvironment: z.ZodEnum<["it_services", "product_based", "startup", "enterprise", "internship", "auto_detect"]>;
    targetRole: z.ZodOptional<z.ZodString>;
    githubUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    portfolioUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, "strip", z.ZodTypeAny, {
    experienceLevel: "student" | "fresher" | "0_1_year" | "1_3_years" | "3_plus_years";
    hiringEnvironment: "it_services" | "product_based" | "startup" | "enterprise" | "internship" | "auto_detect";
    targetRole?: string | undefined;
    githubUrl?: string | undefined;
    portfolioUrl?: string | undefined;
}, {
    experienceLevel: "student" | "fresher" | "0_1_year" | "1_3_years" | "3_plus_years";
    hiringEnvironment: "it_services" | "product_based" | "startup" | "enterprise" | "internship" | "auto_detect";
    targetRole?: string | undefined;
    githubUrl?: string | undefined;
    portfolioUrl?: string | undefined;
}>;
export type CandidateProfileInput = z.infer<typeof CandidateProfileInputSchema>;
export declare const ModelMetadataSchema: z.ZodObject<{
    provider: z.ZodString;
    modelId: z.ZodString;
    promptVersion: z.ZodString;
    promptTokens: z.ZodNumber;
    candidatesTokens: z.ZodNumber;
    totalTokens: z.ZodNumber;
    estimatedCostUsd: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    provider: string;
    modelId: string;
    promptVersion: string;
    promptTokens: number;
    candidatesTokens: number;
    totalTokens: number;
    estimatedCostUsd: number;
}, {
    provider: string;
    modelId: string;
    promptVersion: string;
    promptTokens: number;
    candidatesTokens: number;
    totalTokens: number;
    estimatedCostUsd: number;
}>;
export type ModelMetadata = z.infer<typeof ModelMetadataSchema>;
export declare const AnalysisReportSchema: z.ZodObject<{
    id: z.ZodString;
    isSample: z.ZodDefault<z.ZodBoolean>;
    sampleLabel: z.ZodOptional<z.ZodString>;
    candidateName: z.ZodString;
    jobTitle: z.ZodString;
    companyName: z.ZodString;
    candidateProfile: z.ZodObject<{
        experienceLevel: z.ZodEnum<["student", "fresher", "0_1_year", "1_3_years", "3_plus_years"]>;
        hiringEnvironment: z.ZodEnum<["it_services", "product_based", "startup", "enterprise", "internship", "auto_detect"]>;
        targetRole: z.ZodOptional<z.ZodString>;
        githubUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        portfolioUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    }, "strip", z.ZodTypeAny, {
        experienceLevel: "student" | "fresher" | "0_1_year" | "1_3_years" | "3_plus_years";
        hiringEnvironment: "it_services" | "product_based" | "startup" | "enterprise" | "internship" | "auto_detect";
        targetRole?: string | undefined;
        githubUrl?: string | undefined;
        portfolioUrl?: string | undefined;
    }, {
        experienceLevel: "student" | "fresher" | "0_1_year" | "1_3_years" | "3_plus_years";
        hiringEnvironment: "it_services" | "product_based" | "startup" | "enterprise" | "internship" | "auto_detect";
        targetRole?: string | undefined;
        githubUrl?: string | undefined;
        portfolioUrl?: string | undefined;
    }>;
    resumeSummary: z.ZodObject<{
        fileName: z.ZodString;
        fileType: z.ZodEnum<["pdf", "docx"]>;
        pageCount: z.ZodNumber;
        wordCount: z.ZodNumber;
        detectedSections: z.ZodArray<z.ZodString, "many">;
        extractionWarnings: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        fileName: string;
        fileType: "pdf" | "docx";
        pageCount: number;
        wordCount: number;
        extractionWarnings: string[];
        detectedSections: string[];
    }, {
        fileName: string;
        fileType: "pdf" | "docx";
        pageCount: number;
        wordCount: number;
        extractionWarnings: string[];
        detectedSections: string[];
    }>;
    jobMatch: z.ZodObject<{
        score: z.ZodNullable<z.ZodNumber>;
        confidence: z.ZodEnum<["high", "medium", "low"]>;
        disclaimer: z.ZodString;
        fresherModeApplied: z.ZodBoolean;
        summary: z.ZodString;
        categoryBreakdown: z.ZodArray<z.ZodObject<{
            category: z.ZodEnum<["mandatoryTechnical", "projectsAndExperience", "coreResponsibilities", "educationAndEligibility", "preferredSkills"]>;
            label: z.ZodString;
            baseWeight: z.ZodNumber;
            normalizedWeight: z.ZodNumber;
            score: z.ZodNullable<z.ZodNumber>;
            applicableCount: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            category: "mandatoryTechnical" | "projectsAndExperience" | "coreResponsibilities" | "educationAndEligibility" | "preferredSkills";
            score: number | null;
            label: string;
            baseWeight: number;
            normalizedWeight: number;
            applicableCount: number;
        }, {
            category: "mandatoryTechnical" | "projectsAndExperience" | "coreResponsibilities" | "educationAndEligibility" | "preferredSkills";
            score: number | null;
            label: string;
            baseWeight: number;
            normalizedWeight: number;
            applicableCount: number;
        }>, "many">;
        requirements: z.ZodArray<z.ZodObject<{
            requirementId: z.ZodString;
            requirement: z.ZodString;
            canonicalSkill: z.ZodOptional<z.ZodString>;
            importance: z.ZodEnum<["must_have", "preferred", "contextual", "unclear"]>;
            category: z.ZodEnum<["mandatoryTechnical", "projectsAndExperience", "coreResponsibilities", "educationAndEligibility", "preferredSkills"]>;
            status: z.ZodEnum<["explicitly_demonstrated", "partially_demonstrated", "mentioned_without_evidence", "not_found", "unable_to_determine"]>;
            jdSourceSnippet: z.ZodString;
            resumeEvidenceSnippet: z.ZodNullable<z.ZodString>;
            resumeSection: z.ZodNullable<z.ZodString>;
            explanation: z.ZodString;
            suggestedAction: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            status: "explicitly_demonstrated" | "partially_demonstrated" | "mentioned_without_evidence" | "not_found" | "unable_to_determine";
            importance: "must_have" | "preferred" | "contextual" | "unclear";
            category: "mandatoryTechnical" | "projectsAndExperience" | "coreResponsibilities" | "educationAndEligibility" | "preferredSkills";
            explanation: string;
            requirementId: string;
            requirement: string;
            jdSourceSnippet: string;
            resumeEvidenceSnippet: string | null;
            resumeSection: string | null;
            suggestedAction: string;
            canonicalSkill?: string | undefined;
        }, {
            status: "explicitly_demonstrated" | "partially_demonstrated" | "mentioned_without_evidence" | "not_found" | "unable_to_determine";
            importance: "must_have" | "preferred" | "contextual" | "unclear";
            category: "mandatoryTechnical" | "projectsAndExperience" | "coreResponsibilities" | "educationAndEligibility" | "preferredSkills";
            explanation: string;
            requirementId: string;
            requirement: string;
            jdSourceSnippet: string;
            resumeEvidenceSnippet: string | null;
            resumeSection: string | null;
            suggestedAction: string;
            canonicalSkill?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        summary: string;
        requirements: {
            status: "explicitly_demonstrated" | "partially_demonstrated" | "mentioned_without_evidence" | "not_found" | "unable_to_determine";
            importance: "must_have" | "preferred" | "contextual" | "unclear";
            category: "mandatoryTechnical" | "projectsAndExperience" | "coreResponsibilities" | "educationAndEligibility" | "preferredSkills";
            explanation: string;
            requirementId: string;
            requirement: string;
            jdSourceSnippet: string;
            resumeEvidenceSnippet: string | null;
            resumeSection: string | null;
            suggestedAction: string;
            canonicalSkill?: string | undefined;
        }[];
        score: number | null;
        disclaimer: string;
        confidence: "high" | "medium" | "low";
        fresherModeApplied: boolean;
        categoryBreakdown: {
            category: "mandatoryTechnical" | "projectsAndExperience" | "coreResponsibilities" | "educationAndEligibility" | "preferredSkills";
            score: number | null;
            label: string;
            baseWeight: number;
            normalizedWeight: number;
            applicableCount: number;
        }[];
    }, {
        summary: string;
        requirements: {
            status: "explicitly_demonstrated" | "partially_demonstrated" | "mentioned_without_evidence" | "not_found" | "unable_to_determine";
            importance: "must_have" | "preferred" | "contextual" | "unclear";
            category: "mandatoryTechnical" | "projectsAndExperience" | "coreResponsibilities" | "educationAndEligibility" | "preferredSkills";
            explanation: string;
            requirementId: string;
            requirement: string;
            jdSourceSnippet: string;
            resumeEvidenceSnippet: string | null;
            resumeSection: string | null;
            suggestedAction: string;
            canonicalSkill?: string | undefined;
        }[];
        score: number | null;
        disclaimer: string;
        confidence: "high" | "medium" | "low";
        fresherModeApplied: boolean;
        categoryBreakdown: {
            category: "mandatoryTechnical" | "projectsAndExperience" | "coreResponsibilities" | "educationAndEligibility" | "preferredSkills";
            score: number | null;
            label: string;
            baseWeight: number;
            normalizedWeight: number;
            applicableCount: number;
        }[];
    }>;
    atsEvaluation: z.ZodObject<{
        score: z.ZodNumber;
        disclaimer: z.ZodString;
        checks: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            status: z.ZodEnum<["passed", "failed", "warning", "not_evaluated"]>;
            score: z.ZodNumber;
            maxScore: z.ZodNumber;
            explanation: z.ZodString;
            recommendation: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            status: "passed" | "failed" | "warning" | "not_evaluated";
            id: string;
            name: string;
            score: number;
            maxScore: number;
            explanation: string;
            recommendation?: string | undefined;
        }, {
            status: "passed" | "failed" | "warning" | "not_evaluated";
            id: string;
            name: string;
            score: number;
            maxScore: number;
            explanation: string;
            recommendation?: string | undefined;
        }>, "many">;
        passedCount: z.ZodNumber;
        failedCount: z.ZodNumber;
        warningCount: z.ZodNumber;
        notEvaluatedCount: z.ZodNumber;
        recommendedFixes: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        score: number;
        disclaimer: string;
        checks: {
            status: "passed" | "failed" | "warning" | "not_evaluated";
            id: string;
            name: string;
            score: number;
            maxScore: number;
            explanation: string;
            recommendation?: string | undefined;
        }[];
        passedCount: number;
        failedCount: number;
        warningCount: number;
        notEvaluatedCount: number;
        recommendedFixes: string[];
    }, {
        score: number;
        disclaimer: string;
        checks: {
            status: "passed" | "failed" | "warning" | "not_evaluated";
            id: string;
            name: string;
            score: number;
            maxScore: number;
            explanation: string;
            recommendation?: string | undefined;
        }[];
        passedCount: number;
        failedCount: number;
        warningCount: number;
        notEvaluatedCount: number;
        recommendedFixes: string[];
    }>;
    hrEvaluation: z.ZodObject<{
        verdict: z.ZodEnum<["Strong Match", "Potential Match", "Needs Improvement", "Significant Gaps"]>;
        screeningImpression: z.ZodString;
        reasoningSummary: z.ZodString;
        strengths: z.ZodArray<z.ZodString, "many">;
        concerns: z.ZodArray<z.ZodString, "many">;
        relevantEvidence: z.ZodArray<z.ZodString, "many">;
        missingEvidence: z.ZodArray<z.ZodString, "many">;
        improvementPriorities: z.ZodArray<z.ZodString, "many">;
        readinessGuidance: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        verdict: "Strong Match" | "Potential Match" | "Needs Improvement" | "Significant Gaps";
        screeningImpression: string;
        reasoningSummary: string;
        strengths: string[];
        concerns: string[];
        relevantEvidence: string[];
        missingEvidence: string[];
        improvementPriorities: string[];
        readinessGuidance: string;
    }, {
        verdict: "Strong Match" | "Potential Match" | "Needs Improvement" | "Significant Gaps";
        screeningImpression: string;
        reasoningSummary: string;
        strengths: string[];
        concerns: string[];
        relevantEvidence: string[];
        missingEvidence: string[];
        improvementPriorities: string[];
        readinessGuidance: string;
    }>;
    skillAnalysis: z.ZodObject<{
        demonstrated: z.ZodArray<z.ZodString, "many">;
        partial: z.ZodArray<z.ZodString, "many">;
        mentionedOnly: z.ZodArray<z.ZodString, "many">;
        missing: z.ZodArray<z.ZodObject<{
            skill: z.ZodString;
            group: z.ZodEnum<["critical_gaps", "important_gaps", "optional_improvements", "visibility_gaps"]>;
            priority: z.ZodEnum<["high", "medium", "low"]>;
            whyItMatters: z.ZodString;
            jdEvidence: z.ZodString;
            resumeEvidence: z.ZodNullable<z.ZodString>;
            suggestedNextAction: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            skill: string;
            group: "critical_gaps" | "important_gaps" | "optional_improvements" | "visibility_gaps";
            priority: "high" | "medium" | "low";
            whyItMatters: string;
            jdEvidence: string;
            resumeEvidence: string | null;
            suggestedNextAction: string;
        }, {
            skill: string;
            group: "critical_gaps" | "important_gaps" | "optional_improvements" | "visibility_gaps";
            priority: "high" | "medium" | "low";
            whyItMatters: string;
            jdEvidence: string;
            resumeEvidence: string | null;
            suggestedNextAction: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        demonstrated: string[];
        partial: string[];
        mentionedOnly: string[];
        missing: {
            skill: string;
            group: "critical_gaps" | "important_gaps" | "optional_improvements" | "visibility_gaps";
            priority: "high" | "medium" | "low";
            whyItMatters: string;
            jdEvidence: string;
            resumeEvidence: string | null;
            suggestedNextAction: string;
        }[];
    }, {
        demonstrated: string[];
        partial: string[];
        mentionedOnly: string[];
        missing: {
            skill: string;
            group: "critical_gaps" | "important_gaps" | "optional_improvements" | "visibility_gaps";
            priority: "high" | "medium" | "low";
            whyItMatters: string;
            jdEvidence: string;
            resumeEvidence: string | null;
            suggestedNextAction: string;
        }[];
    }>;
    projectAnalysis: z.ZodArray<z.ZodObject<{
        projectName: z.ZodString;
        relevanceToJD: z.ZodEnum<["high", "medium", "low"]>;
        technologiesDemonstrated: z.ZodArray<z.ZodString, "many">;
        technologiesMissingForJD: z.ZodArray<z.ZodString, "many">;
        strengths: z.ZodArray<z.ZodString, "many">;
        gaps: z.ZodArray<z.ZodString, "many">;
        complexityAssessment: z.ZodString;
        recommendedEnhancements: z.ZodArray<z.ZodString, "many">;
        sourceSnippet: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        strengths: string[];
        projectName: string;
        relevanceToJD: "high" | "medium" | "low";
        technologiesDemonstrated: string[];
        technologiesMissingForJD: string[];
        gaps: string[];
        complexityAssessment: string;
        recommendedEnhancements: string[];
        sourceSnippet: string;
    }, {
        strengths: string[];
        projectName: string;
        relevanceToJD: "high" | "medium" | "low";
        technologiesDemonstrated: string[];
        technologiesMissingForJD: string[];
        gaps: string[];
        complexityAssessment: string;
        recommendedEnhancements: string[];
        sourceSnippet: string;
    }>, "many">;
    rewriteSuggestions: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        section: z.ZodString;
        originalText: z.ZodString;
        suggestedRewrite: z.ZodString;
        whyItIsBetter: z.ZodString;
        relevantJDSkills: z.ZodArray<z.ZodString, "many">;
        claimsRequiringVerification: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        id: string;
        section: string;
        originalText: string;
        suggestedRewrite: string;
        whyItIsBetter: string;
        relevantJDSkills: string[];
        claimsRequiringVerification: string[];
    }, {
        id: string;
        section: string;
        originalText: string;
        suggestedRewrite: string;
        whyItIsBetter: string;
        relevantJDSkills: string[];
        claimsRequiringVerification: string[];
    }>, "many">;
    roadmap: z.ZodObject<{
        durationWeeks: z.ZodNumber;
        disclaimer: z.ZodString;
        tasks: z.ZodArray<z.ZodObject<{
            taskId: z.ZodString;
            week: z.ZodNumber;
            skill: z.ZodString;
            title: z.ZodString;
            description: z.ZodString;
            priority: z.ZodEnum<["high", "medium", "low"]>;
            estimatedEffort: z.ZodString;
            supportingProjectSuggestion: z.ZodString;
            completed: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            title: string;
            skill: string;
            priority: "high" | "medium" | "low";
            taskId: string;
            week: number;
            description: string;
            estimatedEffort: string;
            supportingProjectSuggestion: string;
            completed: boolean;
        }, {
            title: string;
            skill: string;
            priority: "high" | "medium" | "low";
            taskId: string;
            week: number;
            description: string;
            estimatedEffort: string;
            supportingProjectSuggestion: string;
            completed?: boolean | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        disclaimer: string;
        durationWeeks: number;
        tasks: {
            title: string;
            skill: string;
            priority: "high" | "medium" | "low";
            taskId: string;
            week: number;
            description: string;
            estimatedEffort: string;
            supportingProjectSuggestion: string;
            completed: boolean;
        }[];
    }, {
        disclaimer: string;
        durationWeeks: number;
        tasks: {
            title: string;
            skill: string;
            priority: "high" | "medium" | "low";
            taskId: string;
            week: number;
            description: string;
            estimatedEffort: string;
            supportingProjectSuggestion: string;
            completed?: boolean | undefined;
        }[];
    }>;
    interviewQuestions: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        category: z.ZodEnum<["technical", "project_based", "problem_solving", "behavioral", "missing_requirement"]>;
        question: z.ZodString;
        difficulty: z.ZodEnum<["foundational", "intermediate", "advanced"]>;
        skillTested: z.ZodString;
        whyInterviewerAsks: z.ZodString;
        suggestedAnswerFramework: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        category: "technical" | "project_based" | "problem_solving" | "behavioral" | "missing_requirement";
        question: string;
        difficulty: "foundational" | "intermediate" | "advanced";
        skillTested: string;
        whyInterviewerAsks: string;
        suggestedAnswerFramework: string;
    }, {
        id: string;
        category: "technical" | "project_based" | "problem_solving" | "behavioral" | "missing_requirement";
        question: string;
        difficulty: "foundational" | "intermediate" | "advanced";
        skillTested: string;
        whyInterviewerAsks: string;
        suggestedAnswerFramework: string;
    }>, "many">;
    topRecommendedImprovements: z.ZodArray<z.ZodString, "many">;
    analysisVersion: z.ZodString;
    scoringVersion: z.ZodString;
    modelMetadata: z.ZodObject<{
        provider: z.ZodString;
        modelId: z.ZodString;
        promptVersion: z.ZodString;
        promptTokens: z.ZodNumber;
        candidatesTokens: z.ZodNumber;
        totalTokens: z.ZodNumber;
        estimatedCostUsd: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        provider: string;
        modelId: string;
        promptVersion: string;
        promptTokens: number;
        candidatesTokens: number;
        totalTokens: number;
        estimatedCostUsd: number;
    }, {
        provider: string;
        modelId: string;
        promptVersion: string;
        promptTokens: number;
        candidatesTokens: number;
        totalTokens: number;
        estimatedCostUsd: number;
    }>;
    jdHash: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    candidateName: string;
    id: string;
    isSample: boolean;
    jobTitle: string;
    companyName: string;
    candidateProfile: {
        experienceLevel: "student" | "fresher" | "0_1_year" | "1_3_years" | "3_plus_years";
        hiringEnvironment: "it_services" | "product_based" | "startup" | "enterprise" | "internship" | "auto_detect";
        targetRole?: string | undefined;
        githubUrl?: string | undefined;
        portfolioUrl?: string | undefined;
    };
    resumeSummary: {
        fileName: string;
        fileType: "pdf" | "docx";
        pageCount: number;
        wordCount: number;
        extractionWarnings: string[];
        detectedSections: string[];
    };
    jobMatch: {
        summary: string;
        requirements: {
            status: "explicitly_demonstrated" | "partially_demonstrated" | "mentioned_without_evidence" | "not_found" | "unable_to_determine";
            importance: "must_have" | "preferred" | "contextual" | "unclear";
            category: "mandatoryTechnical" | "projectsAndExperience" | "coreResponsibilities" | "educationAndEligibility" | "preferredSkills";
            explanation: string;
            requirementId: string;
            requirement: string;
            jdSourceSnippet: string;
            resumeEvidenceSnippet: string | null;
            resumeSection: string | null;
            suggestedAction: string;
            canonicalSkill?: string | undefined;
        }[];
        score: number | null;
        disclaimer: string;
        confidence: "high" | "medium" | "low";
        fresherModeApplied: boolean;
        categoryBreakdown: {
            category: "mandatoryTechnical" | "projectsAndExperience" | "coreResponsibilities" | "educationAndEligibility" | "preferredSkills";
            score: number | null;
            label: string;
            baseWeight: number;
            normalizedWeight: number;
            applicableCount: number;
        }[];
    };
    atsEvaluation: {
        score: number;
        disclaimer: string;
        checks: {
            status: "passed" | "failed" | "warning" | "not_evaluated";
            id: string;
            name: string;
            score: number;
            maxScore: number;
            explanation: string;
            recommendation?: string | undefined;
        }[];
        passedCount: number;
        failedCount: number;
        warningCount: number;
        notEvaluatedCount: number;
        recommendedFixes: string[];
    };
    hrEvaluation: {
        verdict: "Strong Match" | "Potential Match" | "Needs Improvement" | "Significant Gaps";
        screeningImpression: string;
        reasoningSummary: string;
        strengths: string[];
        concerns: string[];
        relevantEvidence: string[];
        missingEvidence: string[];
        improvementPriorities: string[];
        readinessGuidance: string;
    };
    skillAnalysis: {
        demonstrated: string[];
        partial: string[];
        mentionedOnly: string[];
        missing: {
            skill: string;
            group: "critical_gaps" | "important_gaps" | "optional_improvements" | "visibility_gaps";
            priority: "high" | "medium" | "low";
            whyItMatters: string;
            jdEvidence: string;
            resumeEvidence: string | null;
            suggestedNextAction: string;
        }[];
    };
    projectAnalysis: {
        strengths: string[];
        projectName: string;
        relevanceToJD: "high" | "medium" | "low";
        technologiesDemonstrated: string[];
        technologiesMissingForJD: string[];
        gaps: string[];
        complexityAssessment: string;
        recommendedEnhancements: string[];
        sourceSnippet: string;
    }[];
    rewriteSuggestions: {
        id: string;
        section: string;
        originalText: string;
        suggestedRewrite: string;
        whyItIsBetter: string;
        relevantJDSkills: string[];
        claimsRequiringVerification: string[];
    }[];
    roadmap: {
        disclaimer: string;
        durationWeeks: number;
        tasks: {
            title: string;
            skill: string;
            priority: "high" | "medium" | "low";
            taskId: string;
            week: number;
            description: string;
            estimatedEffort: string;
            supportingProjectSuggestion: string;
            completed: boolean;
        }[];
    };
    interviewQuestions: {
        id: string;
        category: "technical" | "project_based" | "problem_solving" | "behavioral" | "missing_requirement";
        question: string;
        difficulty: "foundational" | "intermediate" | "advanced";
        skillTested: string;
        whyInterviewerAsks: string;
        suggestedAnswerFramework: string;
    }[];
    topRecommendedImprovements: string[];
    analysisVersion: string;
    scoringVersion: string;
    modelMetadata: {
        provider: string;
        modelId: string;
        promptVersion: string;
        promptTokens: number;
        candidatesTokens: number;
        totalTokens: number;
        estimatedCostUsd: number;
    };
    createdAt: string;
    updatedAt: string;
    sampleLabel?: string | undefined;
    jdHash?: string | undefined;
}, {
    candidateName: string;
    id: string;
    jobTitle: string;
    companyName: string;
    candidateProfile: {
        experienceLevel: "student" | "fresher" | "0_1_year" | "1_3_years" | "3_plus_years";
        hiringEnvironment: "it_services" | "product_based" | "startup" | "enterprise" | "internship" | "auto_detect";
        targetRole?: string | undefined;
        githubUrl?: string | undefined;
        portfolioUrl?: string | undefined;
    };
    resumeSummary: {
        fileName: string;
        fileType: "pdf" | "docx";
        pageCount: number;
        wordCount: number;
        extractionWarnings: string[];
        detectedSections: string[];
    };
    jobMatch: {
        summary: string;
        requirements: {
            status: "explicitly_demonstrated" | "partially_demonstrated" | "mentioned_without_evidence" | "not_found" | "unable_to_determine";
            importance: "must_have" | "preferred" | "contextual" | "unclear";
            category: "mandatoryTechnical" | "projectsAndExperience" | "coreResponsibilities" | "educationAndEligibility" | "preferredSkills";
            explanation: string;
            requirementId: string;
            requirement: string;
            jdSourceSnippet: string;
            resumeEvidenceSnippet: string | null;
            resumeSection: string | null;
            suggestedAction: string;
            canonicalSkill?: string | undefined;
        }[];
        score: number | null;
        disclaimer: string;
        confidence: "high" | "medium" | "low";
        fresherModeApplied: boolean;
        categoryBreakdown: {
            category: "mandatoryTechnical" | "projectsAndExperience" | "coreResponsibilities" | "educationAndEligibility" | "preferredSkills";
            score: number | null;
            label: string;
            baseWeight: number;
            normalizedWeight: number;
            applicableCount: number;
        }[];
    };
    atsEvaluation: {
        score: number;
        disclaimer: string;
        checks: {
            status: "passed" | "failed" | "warning" | "not_evaluated";
            id: string;
            name: string;
            score: number;
            maxScore: number;
            explanation: string;
            recommendation?: string | undefined;
        }[];
        passedCount: number;
        failedCount: number;
        warningCount: number;
        notEvaluatedCount: number;
        recommendedFixes: string[];
    };
    hrEvaluation: {
        verdict: "Strong Match" | "Potential Match" | "Needs Improvement" | "Significant Gaps";
        screeningImpression: string;
        reasoningSummary: string;
        strengths: string[];
        concerns: string[];
        relevantEvidence: string[];
        missingEvidence: string[];
        improvementPriorities: string[];
        readinessGuidance: string;
    };
    skillAnalysis: {
        demonstrated: string[];
        partial: string[];
        mentionedOnly: string[];
        missing: {
            skill: string;
            group: "critical_gaps" | "important_gaps" | "optional_improvements" | "visibility_gaps";
            priority: "high" | "medium" | "low";
            whyItMatters: string;
            jdEvidence: string;
            resumeEvidence: string | null;
            suggestedNextAction: string;
        }[];
    };
    projectAnalysis: {
        strengths: string[];
        projectName: string;
        relevanceToJD: "high" | "medium" | "low";
        technologiesDemonstrated: string[];
        technologiesMissingForJD: string[];
        gaps: string[];
        complexityAssessment: string;
        recommendedEnhancements: string[];
        sourceSnippet: string;
    }[];
    rewriteSuggestions: {
        id: string;
        section: string;
        originalText: string;
        suggestedRewrite: string;
        whyItIsBetter: string;
        relevantJDSkills: string[];
        claimsRequiringVerification: string[];
    }[];
    roadmap: {
        disclaimer: string;
        durationWeeks: number;
        tasks: {
            title: string;
            skill: string;
            priority: "high" | "medium" | "low";
            taskId: string;
            week: number;
            description: string;
            estimatedEffort: string;
            supportingProjectSuggestion: string;
            completed?: boolean | undefined;
        }[];
    };
    interviewQuestions: {
        id: string;
        category: "technical" | "project_based" | "problem_solving" | "behavioral" | "missing_requirement";
        question: string;
        difficulty: "foundational" | "intermediate" | "advanced";
        skillTested: string;
        whyInterviewerAsks: string;
        suggestedAnswerFramework: string;
    }[];
    topRecommendedImprovements: string[];
    analysisVersion: string;
    scoringVersion: string;
    modelMetadata: {
        provider: string;
        modelId: string;
        promptVersion: string;
        promptTokens: number;
        candidatesTokens: number;
        totalTokens: number;
        estimatedCostUsd: number;
    };
    createdAt: string;
    updatedAt: string;
    isSample?: boolean | undefined;
    sampleLabel?: string | undefined;
    jdHash?: string | undefined;
}>;
export type AnalysisReport = z.infer<typeof AnalysisReportSchema>;
export declare const AnalysisStageStatusSchema: z.ZodObject<{
    key: z.ZodString;
    label: z.ZodString;
    status: z.ZodEnum<["pending", "running", "completed", "failed"]>;
}, "strip", z.ZodTypeAny, {
    key: string;
    status: "failed" | "completed" | "pending" | "running";
    label: string;
}, {
    key: string;
    status: "failed" | "completed" | "pending" | "running";
    label: string;
}>;
export type AnalysisStageStatus = z.infer<typeof AnalysisStageStatusSchema>;
export declare const AnalysisJobStatusResponseSchema: z.ZodObject<{
    analysisId: z.ZodString;
    status: z.ZodEnum<["queued", "processing", "completed", "failed"]>;
    currentStage: z.ZodString;
    progressPercent: z.ZodNumber;
    stages: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        label: z.ZodString;
        status: z.ZodEnum<["pending", "running", "completed", "failed"]>;
    }, "strip", z.ZodTypeAny, {
        key: string;
        status: "failed" | "completed" | "pending" | "running";
        label: string;
    }, {
        key: string;
        status: "failed" | "completed" | "pending" | "running";
        label: string;
    }>, "many">;
    reportId: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: string;
        message: string;
    }, {
        code: string;
        message: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    status: "failed" | "completed" | "queued" | "processing";
    analysisId: string;
    currentStage: string;
    progressPercent: number;
    stages: {
        key: string;
        status: "failed" | "completed" | "pending" | "running";
        label: string;
    }[];
    reportId?: string | undefined;
    error?: {
        code: string;
        message: string;
    } | undefined;
}, {
    status: "failed" | "completed" | "queued" | "processing";
    analysisId: string;
    currentStage: string;
    progressPercent: number;
    stages: {
        key: string;
        status: "failed" | "completed" | "pending" | "running";
        label: string;
    }[];
    reportId?: string | undefined;
    error?: {
        code: string;
        message: string;
    } | undefined;
}>;
export type AnalysisJobStatusResponse = z.infer<typeof AnalysisJobStatusResponseSchema>;
//# sourceMappingURL=analysis.d.ts.map