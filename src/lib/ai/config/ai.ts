// AI Provider Configurations
export interface AIProviderConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export const providerConfigs = {
  openai: {
    model: 'gpt-3.5-turbo-1106',
    temperature: 0.6,
    maxTokens: 1000,
  },
  anthropic: {
    model: 'claude-3-opus-20240229',
    temperature: 0.6,
    maxTokens: 4096,
  },
  google: {
    model: 'gemini-pro',
    temperature: 0.6,
    maxTokens: 2048,
  },
};

export function getProviderConfig(provider: keyof typeof providerConfigs, customConfig?: Partial<AIProviderConfig>): AIProviderConfig {
  const baseConfig = providerConfigs[provider];
  return {
    apiKey: process.env.OPENAI_API_KEY || '',
    ...baseConfig,
    ...customConfig,
  };
}
