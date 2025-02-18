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
}

export interface AIProviderContext {
  systemPrompt?: string;
  previousMessages?: Array<{role: 'user' | 'assistant', content: string}>;
}

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
    context?: AIProviderContext
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
    // Dynamic provider loading will be implemented later
    // For now, we'll import the OpenAI provider directly
    const { OpenAIProvider } = require('./providers/openai');
    this.provider = new OpenAIProvider(options);
  }

  // Delegate methods to current provider
  async promptForJSON(
    prompt: string, 
    config?: AIPromptConfig,
    context?: AIProviderContext
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
