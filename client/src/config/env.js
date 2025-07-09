/**
 * Environment configuration with validation
 */

const requiredEnvVars = {
  VITE_BASE_URL: import.meta.env.VITE_BASE_URL,
  VITE_CURRENCY: import.meta.env.VITE_CURRENCY,
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
  VITE_API_TIMEOUT: import.meta.env.VITE_API_TIMEOUT,
};

// Validate required environment variables
const validateEnv = () => {
  const missingVars = Object.entries(requiredEnvVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
};

// Validate on module load
validateEnv();

export const config = {
  api: {
    baseURL: requiredEnvVars.VITE_BASE_URL,
    timeout: parseInt(requiredEnvVars.VITE_API_TIMEOUT || '10000'),
  },
  app: {
    name: requiredEnvVars.VITE_APP_NAME || 'Car Rental',
    currency: requiredEnvVars.VITE_CURRENCY || 'GBP',
  },
  features: {
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableDevTools: import.meta.env.DEV,
  },
};
