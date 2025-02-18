import OpenAI from 'openai';
import { 
  BaseAIProvider, 
  AIPromptConfig, 
  AIResponse, 
  AIProviderOptions,
  AIProviderContext
} from '../interfaces';

export class OpenAIProvider extends BaseAIProvider {
  private openai: OpenAI;

  constructor(options: AIProviderOptions = {}) {
    super(options);
    this.openai = new OpenAI({ apiKey: this.apiKey });
  }

  async promptForJSON(
    prompt: string, 
    config: AIPromptConfig = {},
    context?: AIProviderContext
  ): Promise<AIResponse> {
    try {
      // Default configuration
      const defaultConfig = {
        model: 'gpt-3.5-turbo-1106',
        temperature: 0.7,
        maxTokens: 1000,
        responseFormat: 'json_object' as const
      };

      // Merge default and provided configs
      const finalConfig = { ...defaultConfig, ...config };

      // Prepare messages with roles
      const messages: Array<{role: 'system' | 'user' | 'assistant', content: string}> = [
        {
          role: 'system', 
          content: context?.systemPrompt || 'You are a helpful assistant that always responds in valid JSON format.'
        }
      ];

      // Add any previous conversation context
      if (context?.previousMessages) {
        messages.push(...context.previousMessages);
      }

      // Add current user prompt
      messages.push({
        role: 'user', 
        content: prompt
      });

      // Make the API call
      const response = await this.openai.chat.completions.create({
        model: finalConfig.model,
        temperature: finalConfig.temperature,
        max_tokens: finalConfig.maxTokens,
        response_format: { type: finalConfig.responseFormat },
        messages: messages
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

// Optional: Export a pre-configured instance
export const openaiConnector = new OpenAIProvider();
