import { z } from 'zod';
export declare const RegisterRequestSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    name: string;
    password: string;
}, {
    email: string;
    name: string;
    password: string;
}>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export declare const LoginRequestSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export declare const ForgotPasswordRequestSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;
export declare const ResetPasswordRequestSchema: z.ZodObject<{
    token: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
    newPassword: string;
}, {
    token: string;
    newPassword: string;
}>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;
export declare const ParseJDRequestSchema: z.ZodEffects<z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    company: z.ZodOptional<z.ZodString>;
    rawText: z.ZodOptional<z.ZodString>;
    url: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, "strip", z.ZodTypeAny, {
    rawText?: string | undefined;
    title?: string | undefined;
    company?: string | undefined;
    url?: string | undefined;
}, {
    rawText?: string | undefined;
    title?: string | undefined;
    company?: string | undefined;
    url?: string | undefined;
}>, {
    rawText?: string | undefined;
    title?: string | undefined;
    company?: string | undefined;
    url?: string | undefined;
}, {
    rawText?: string | undefined;
    title?: string | undefined;
    company?: string | undefined;
    url?: string | undefined;
}>;
export type ParseJDRequest = z.infer<typeof ParseJDRequestSchema>;
export declare const CreateAnalysisRequestSchema: z.ZodObject<{
    resumeId: z.ZodString;
    jobDescription: z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        company: z.ZodOptional<z.ZodString>;
        rawText: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        rawText: string;
        title?: string | undefined;
        company?: string | undefined;
    }, {
        rawText: string;
        title?: string | undefined;
        company?: string | undefined;
    }>;
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
    saveResume: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    candidateProfile: {
        experienceLevel: "student" | "fresher" | "0_1_year" | "1_3_years" | "3_plus_years";
        hiringEnvironment: "it_services" | "product_based" | "startup" | "enterprise" | "internship" | "auto_detect";
        targetRole?: string | undefined;
        githubUrl?: string | undefined;
        portfolioUrl?: string | undefined;
    };
    resumeId: string;
    jobDescription: {
        rawText: string;
        title?: string | undefined;
        company?: string | undefined;
    };
    saveResume: boolean;
}, {
    candidateProfile: {
        experienceLevel: "student" | "fresher" | "0_1_year" | "1_3_years" | "3_plus_years";
        hiringEnvironment: "it_services" | "product_based" | "startup" | "enterprise" | "internship" | "auto_detect";
        targetRole?: string | undefined;
        githubUrl?: string | undefined;
        portfolioUrl?: string | undefined;
    };
    resumeId: string;
    jobDescription: {
        rawText: string;
        title?: string | undefined;
        company?: string | undefined;
    };
    saveResume?: boolean | undefined;
}>;
export type CreateAnalysisRequest = z.infer<typeof CreateAnalysisRequestSchema>;
export declare const UpdateRoadmapProgressSchema: z.ZodObject<{
    taskId: z.ZodString;
    completed: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    taskId: string;
    completed: boolean;
}, {
    taskId: string;
    completed: boolean;
}>;
export type UpdateRoadmapProgressRequest = z.infer<typeof UpdateRoadmapProgressSchema>;
export declare const ReportListQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodString>;
    sort: z.ZodDefault<z.ZodEnum<["newest", "oldest", "match_desc"]>>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    sort: "newest" | "oldest" | "match_desc";
    page: number;
    limit: number;
    search?: string | undefined;
    role?: string | undefined;
}, {
    sort?: "newest" | "oldest" | "match_desc" | undefined;
    search?: string | undefined;
    role?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}>;
export type ReportListQuery = z.infer<typeof ReportListQuerySchema>;
//# sourceMappingURL=api.d.ts.map