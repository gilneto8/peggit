import { getProviderConfig } from '@/config/ai';

// Shared Interfaces for AI Providers

export interface AIPromptConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json_object' | 'text';
}

export interface AIResponse {
  [key: string]: any;
}

export interface AIProviderOptions {
  apiKey?: string;
  config?: AIPromptConfig;
}

export abstract class BaseAIProvider {
  protected apiKey: string;
  protected config: AIPromptConfig;

  constructor(options: AIProviderOptions = {}) {
    // Use environment variable, passed key, or throw error
    this.apiKey = options.apiKey || process.env.OPENAI_API_KEY || '';
    
    if (!this.apiKey) {
      throw new Error('API key is required. Set it via constructor or environment variable.');
    }

    // Merge default and custom configurations
    this.config = {
      model: 'gpt-3.5-turbo-1106',
      temperature: 0.6,
      maxTokens: 1000,
      responseFormat: 'json_object',
      ...options.config
    };
  }

  // Abstract method to be implemented by specific providers
  abstract promptForJSON(
    prompt: string, 
    config?: AIPromptConfig,
    context?: { 
      systemPrompt?: string, 
      previousMessages?: Array<{role: 'user' | 'assistant', content: string}>
    }
  ): Promise<AIResponse>;

  // Utility method for response validation
  validateResponse(
    response: AIResponse, 
    expectedKeys?: string[]
  ): boolean {
    if (!response || typeof response !== 'object') {
      return false;
    }

    if (expectedKeys) {
      return expectedKeys.every(key => key in response);
    }

    return true;
  }
}

export class AIConnector {
  private provider: BaseAIProvider;

  constructor(
    providerType: string = 'openai', 
    options: AIProviderOptions = {}
  ) {
    // Dynamic provider loading
    switch(providerType.toLowerCase()) {
      case 'openai':
      default:
        const { OpenAIProvider } = require('./providers/openai');
        this.provider = new OpenAIProvider(options);
        break;
      case 'anthropic':
        const { AnthropicProvider } = require('./providers/anthropic');
        this.provider = new AnthropicProvider(options);
        break;
    }
  }

  // Delegate methods to current provider
  async promptForJSON(
    prompt: string, 
    config?: AIPromptConfig,
    context?: { 
      systemPrompt?: string, 
      previousMessages?: Array<{role: 'user' | 'assistant', content: string}>
    }
  ): Promise<AIResponse> {
    return this.provider.promptForJSON(prompt, config, context);
  }

  // Expose response validation
  validateResponse(
    response: AIResponse, 
    expectedKeys?: string[]
  ): boolean {
    return this.provider.validateResponse(response, expectedKeys);
  }
}

// Export a default instance for easy use
export const aiConnector = new AIConnector();
