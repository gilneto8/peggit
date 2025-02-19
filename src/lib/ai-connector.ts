import OpenAI from 'openai';

// Shared Interfaces
export interface AIPromptConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json_object' | 'text';
}

export interface AIResponse {
  [key: string]: unknown;
}

export interface AIProviderOptions {
  apiKey?: string;
}

// Abstract Base Provider
export abstract class BaseAIProvider {
  protected apiKey: string;

  constructor(options: AIProviderOptions = {}) {
    this.apiKey = options.apiKey || process.env.OPENAI_API_KEY || '';

    if (!this.apiKey) {
      throw new Error('API key is required. Set it via constructor or environment variable.');
    }
  }

  // Abstract method to be implemented by specific providers
  abstract promptForJSON(
    prompt: string,
    config?: AIPromptConfig,
    context?: {
      systemPrompt?: string;
      previousMessages?: Array<{ role: 'user' | 'assistant'; content: string }>;
    },
  ): Promise<AIResponse>;

  // Utility method for response validation
  validateResponse(response: AIResponse, expectedKeys?: string[]): boolean {
    if (!response || typeof response !== 'object') {
      return false;
    }

    if (expectedKeys) {
      return expectedKeys.every(key => key in response);
    }

    return true;
  }
}

// OpenAI Specific Provider
export class OpenAIProvider extends BaseAIProvider {
  private openai: OpenAI;

  constructor(options: AIProviderOptions = {}) {
    super(options);
    this.openai = new OpenAI({ apiKey: this.apiKey });
  }

  async promptForJSON(
    prompt: string,
    config: AIPromptConfig = {},
    context?: {
      systemPrompt?: string;
      previousMessages?: Array<{ role: 'user' | 'assistant'; content: string }>;
    },
  ): Promise<AIResponse> {
    try {
      // Default configuration
      const defaultConfig = {
        model: 'gpt-3.5-turbo-1106',
        temperature: 0.7,
        maxTokens: 1000,
        responseFormat: 'json_object' as const,
      };

      // Merge default and provided configs
      const finalConfig = { ...defaultConfig, ...config };

      // Prepare messages with roles
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        {
          role: 'system',
          content: context?.systemPrompt || 'You are a helpful assistant that always responds in valid JSON format.',
        },
      ];

      // Add any previous conversation context
      if (context?.previousMessages) {
        messages.push(...context.previousMessages);
      }

      // Add current user prompt
      messages.push({
        role: 'user',
        content: prompt,
      });

      // Make the API call
      const response = await this.openai.chat.completions.create({
        model: finalConfig.model,
        temperature: finalConfig.temperature,
        max_tokens: finalConfig.maxTokens,
        response_format: { type: finalConfig.responseFormat },
        messages: messages,
      });

      // Extract and parse the JSON response
      const jsonResponse = response.choices[0].message.content;

      if (!jsonResponse) {
        throw new Error('No response received from AI');
      }

      return JSON.parse(jsonResponse);
    } catch (error) {
      console.error('OpenAI Connector Error:', error);
      throw error;
    }
  }
}

// AI Connector Manager
export class AIConnector {
  private provider: BaseAIProvider;

  constructor(providerType: 'openai' = 'openai', options: AIProviderOptions = {}) {
    switch (providerType) {
      case 'openai':
      default:
        this.provider = new OpenAIProvider(options);
    }
  }

  // Delegate methods to current provider
  async promptForJSON(
    prompt: string,
    config?: AIPromptConfig,
    context?: {
      systemPrompt?: string;
      previousMessages?: Array<{ role: 'user' | 'assistant'; content: string }>;
    },
  ): Promise<AIResponse> {
    return this.provider.promptForJSON(prompt, config, context);
  }

  // Expose response validation
  validateResponse(response: AIResponse, expectedKeys?: string[]): boolean {
    return this.provider.validateResponse(response, expectedKeys);
  }
}

// Export a default instance for easy use
export const aiConnector = new AIConnector();
