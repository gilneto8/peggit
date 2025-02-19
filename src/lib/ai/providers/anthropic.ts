import { BaseAIProvider, AIPromptConfig, AIResponse, AIProviderOptions } from '../interfaces';

export class AnthropicProvider extends BaseAIProvider {
  constructor(options: AIProviderOptions = {}) {
    super(options);
    // Anthropic client initialization would go here
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
      const finalConfig = {
        model: 'claude-2.1',
        temperature: 0.7,
        maxTokens: 1000,
        ...config,
      };

      // Prepare the messages
      let fullPrompt = '';

      if (context?.systemPrompt) {
        fullPrompt += `${context.systemPrompt}\n\n`;
      }

      if (context?.previousMessages?.length) {
        for (const msg of context.previousMessages) {
          fullPrompt += `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}\n\n`;
        }
      }

      fullPrompt += `Human: ${prompt}\n\nAssistant: `;

      // Make the API call using Anthropic's SDK
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: finalConfig.model,
          max_tokens: finalConfig.maxTokens,
          temperature: finalConfig.temperature,
          messages: [{ role: 'user', content: fullPrompt }],
        }),
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in Anthropic provider:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error in Anthropic provider',
        prompt,
      };
    }
  }
}

// Optional: Export a pre-configured instance
export const anthropicConnector = new AnthropicProvider();
