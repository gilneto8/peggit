import OpenAI from 'openai';
import { BaseAIProvider, AIPromptConfig, AIResponse, AIProviderOptions } from '../interfaces';

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
      // Merge base config with provided config
      const finalConfig = {
        ...this.config,
        ...config,
      };

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

      // Explicitly type the API call parameters
      const apiParams: OpenAI.Chat.ChatCompletionCreateParams = {
        model: finalConfig.model || 'gpt-3.5-turbo-1106',
        temperature: finalConfig.temperature ?? 0.6,
        max_tokens: finalConfig.maxTokens ?? 1000,
        response_format: {
          type: (finalConfig.responseFormat as 'json_object' | 'text') || 'json_object',
        },
        messages: messages,
      };

      // Make the API call
      const response = await this.openai.chat.completions.create(apiParams);

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

// Optional: Export a pre-configured instance
export const openaiConnector = new OpenAIProvider();
