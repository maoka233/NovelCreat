/**
 * Environment configuration
 * Safely manages environment variables for the renderer process
 */

interface EnvConfig {
  DEEPSEEK_API_KEY: string;
  DEEPSEEK_API_BASE_URL: string;
  NODE_ENV: string;
}

/**
 * Get environment variable with fallback
 */
function getEnv(key: keyof typeof envConfig, defaultValue = ''): string {
  if (window.novelAPI && window.novelAPI.env) {
    // 确保我们只访问 'env' 接口中定义的键
    const typedKey = key as keyof typeof window.novelAPI.env;
    return window.novelAPI.env[typedKey] || defaultValue;
  }
  return defaultValue;
}
/**
 * Environment configuration object
 */
const envConfig = {
  DEEPSEEK_API_KEY: '',
  DEEPSEEK_API_BASE_URL: 'https://api.deepseek.com',
  NODE_ENV: 'development'
};
export const env: EnvConfig = {
  DEEPSEEK_API_KEY: getEnv('DEEPSEEK_API_KEY', ''),
  DEEPSEEK_API_BASE_URL: getEnv('DEEPSEEK_API_BASE_URL', 'https://api.deepseek.com'),
  NODE_ENV: getEnv('NODE_ENV', 'development')
};

/**
 * Check if running in development mode
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Check if running in production mode
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Validate required environment variables
 */
export function validateEnv(): { valid: boolean; missing: string[] } {
  const required = ['DEEPSEEK_API_KEY'];
  const missing: string[] = [];

  for (const key of required) {
    const value = env[key as keyof EnvConfig];
    if (!value || value.trim().length === 0 || value === 'your_api_key_here') {
      missing.push(key);
    }
  }

  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Get masked API key for display (shows only first and last 4 characters)
 */
export function getMaskedApiKey(): string {
  const key = env.DEEPSEEK_API_KEY;
  if (!key || key.length < 12) {
    return '****';
  }
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

export default env;
