export declare const ANALYSIS_VERSION: "analysis-v1.0.0";
export declare const SCORING_VERSION: "scoring-v1.0.0";
export declare const PROMPT_VERSION: "prompt-v1.0.0";
export declare const MAX_RESUME_FILE_SIZE_BYTES: number;
export declare const JOB_MATCH_WEIGHTS: {
    readonly mandatoryTechnical: 0.4;
    readonly projectsAndExperience: 0.25;
    readonly coreResponsibilities: 0.15;
    readonly educationAndEligibility: 0.1;
    readonly preferredSkills: 0.1;
};
export declare const EVIDENCE_MULTIPLIERS: {
    readonly explicitly_demonstrated: 1;
    readonly partially_demonstrated: 0.6;
    readonly mentioned_without_evidence: 0.3;
    readonly not_found: 0;
    readonly unable_to_determine: null;
};
export declare const ATS_DISCLAIMER: "This score estimates compatibility using ScreenMe's documented checks. It does not represent the score assigned by any employer's ATS.";
export declare const JOB_MATCH_DISCLAIMER: "Weighted category assumptions estimate resume-to-JD alignment based on available evidence, not actual hiring probability.";
export declare const ROADMAP_DISCLAIMER: "This personalized 2\u20134 week improvement roadmap targets gaps identified in your resume relative to this job description. Completing it strengthens readiness but does not guarantee job offers.";
export declare const ANALYSIS_STAGES: readonly [{
    readonly key: "validating_inputs";
    readonly label: "Validating resume & job description";
    readonly percent: 10;
}, {
    readonly key: "parsing_resume";
    readonly label: "Extracting resume text & structure";
    readonly percent: 22;
}, {
    readonly key: "parsing_jd";
    readonly label: "Analyzing job description requirements";
    readonly percent: 36;
}, {
    readonly key: "normalizing_skills";
    readonly label: "Normalizing skills & taxonomy";
    readonly percent: 48;
}, {
    readonly key: "ats_checks";
    readonly label: "Running deterministic ATS compatibility checks";
    readonly percent: 60;
}, {
    readonly key: "ai_evaluation";
    readonly label: "Evaluating evidence, HR impression & projects";
    readonly percent: 78;
}, {
    readonly key: "generating_guidance";
    readonly label: "Generating rewrites, roadmap & interview prep";
    readonly percent: 90;
}, {
    readonly key: "scoring_and_saving";
    readonly label: "Computing deterministic scores & assembling report";
    readonly percent: 100;
}];
export type AnalysisStageKey = (typeof ANALYSIS_STAGES)[number]['key'];
//# sourceMappingURL=scoring.d.ts.map