import { GoogleGenAI } from '@google/genai';
import type { ZodType } from 'zod';
import { env } from '../../config/env.js';
import { AIServiceError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

export interface AIUsageMetrics {
  promptTokens: number;
  candidatesTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
}

export interface AIStructuredResult<T> {
  data: T;
  usage: AIUsageMetrics;
  provider: string;
  modelId: string;
}

export interface AIProvider {
  readonly providerName: string;
  readonly modelId: string;
  generateStructured<T>(params: {
    systemInstruction: string;
    userPrompt: string;
    schema: ZodType<T>;
    responseJsonSchema?: Record<string, unknown>;
    temperature?: number;
  }): Promise<AIStructuredResult<T>>;
}

function estimateGeminiFlashCostUsd(promptTokens: number, candidatesTokens: number): number {
  // Approximate Gemini 2.5 Flash pricing ($0.15 / 1M input, $0.60 / 1M output)
  const inputCost = (promptTokens / 1_000_000) * 0.15;
  const outputCost = (candidatesTokens / 1_000_000) * 0.6;
  return Number((inputCost + outputCost).toFixed(6));
}

function extractJsonText(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith('```')) {
    return trimmed
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();
  }
  return trimmed;
}

export class GeminiAIProvider implements AIProvider {
  public readonly providerName = 'gemini';
  public readonly modelId: string;
  private readonly apiKey: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;

  constructor(options?: {
    apiKey?: string;
    modelId?: string;
    timeoutMs?: number;
    maxRetries?: number;
  }) {
    this.apiKey = options?.apiKey ?? env.GEMINI_API_KEY;
    this.modelId = options?.modelId ?? env.GEMINI_MODEL;
    this.timeoutMs = options?.timeoutMs ?? env.AI_TIMEOUT_MS;
    this.maxRetries = options?.maxRetries ?? env.AI_MAX_RETRIES;
  }

  async generateStructured<T>(params: {
    systemInstruction: string;
    userPrompt: string;
    schema: ZodType<T>;
    responseJsonSchema?: Record<string, unknown>;
    temperature?: number;
  }): Promise<AIStructuredResult<T>> {
    if (!this.apiKey || this.apiKey.trim().length < 10) {
      throw new AIServiceError(
        'Google Gemini API key is not configured on the server. Set GEMINI_API_KEY in .env to run live AI analysis.',
        'AI_NOT_CONFIGURED',
        503
      );
    }

    const client = new GoogleGenAI({ apiKey: this.apiKey });
    let lastError: unknown;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const timeoutPromise = new Promise<never>((_resolve, reject) => {
          setTimeout(() => {
            reject(
              new AIServiceError(
                'The AI evaluation timed out. Please retry in a moment.',
                'AI_TIMEOUT',
                504
              )
            );
          }, this.timeoutMs);
        });

        const apiPromise = client.models.generateContent({
          model: this.modelId,
          contents: params.userPrompt,
          config: {
            systemInstruction: params.systemInstruction,
            temperature: params.temperature ?? 0.2,
            responseMimeType: 'application/json',
            ...(params.responseJsonSchema
              ? { responseSchema: params.responseJsonSchema }
              : {}),
          },
        });

        const response = await Promise.race([apiPromise, timeoutPromise]);
        const rawText = response.text;
        if (!rawText) {
          throw new AIServiceError(
            'AI provider returned an empty response.',
            'AI_INVALID_OUTPUT',
            502
          );
        }

        let parsedJson: unknown;
        try {
          parsedJson = JSON.parse(extractJsonText(rawText));
        } catch {
          throw new AIServiceError(
            'AI provider returned malformed JSON output.',
            'AI_INVALID_OUTPUT',
            502
          );
        }

        const validated = params.schema.safeParse(parsedJson);
        if (!validated.success) {
          logger.warn('AI response failed schema validation', {
            attempt,
            issueCount: validated.error.issues.length,
          });
          throw new AIServiceError(
            'AI response did not match the required structured schema.',
            'AI_INVALID_OUTPUT',
            502
          );
        }

        const promptTokens = response.usageMetadata?.promptTokenCount ?? 0;
        const candidatesTokens = response.usageMetadata?.candidatesTokenCount ?? 0;
        const totalTokens =
          response.usageMetadata?.totalTokenCount ?? promptTokens + candidatesTokens;

        return {
          data: validated.data,
          usage: {
            promptTokens,
            candidatesTokens,
            totalTokens,
            estimatedCostUsd: estimateGeminiFlashCostUsd(
              promptTokens,
              candidatesTokens
            ),
          },
          provider: this.providerName,
          modelId: this.modelId,
        };
      } catch (err) {
        lastError = err;
        const isLast = attempt === this.maxRetries;
        if (err instanceof AIServiceError && err.code === 'AI_NOT_CONFIGURED') {
          throw err;
        }
        logger.warn('AI call attempt failed', {
          attempt,
          isLast,
          code: err instanceof AIServiceError ? err.code : 'PROVIDER_ERROR',
        });
        if (!isLast) {
          await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
        }
      }
    }

    if (lastError instanceof AIServiceError) {
      throw lastError;
    }

    throw new AIServiceError(
      'Unable to complete AI analysis right now due to an upstream provider error.',
      'AI_UNAVAILABLE',
      502
    );
  }
}

let activeProvider: AIProvider = new GeminiAIProvider();

export function getAIProvider(): AIProvider {
  return activeProvider;
}

export function setAIProviderForTesting(provider: AIProvider): void {
  activeProvider = provider;
}

export function resetAIProvider(): void {
  activeProvider = new GeminiAIProvider();
}

