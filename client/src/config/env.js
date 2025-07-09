/**
 * Environment configuration with validation and improved DX
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
    if (import.meta.env.PROD) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}`
      );
    } else {
      // Warn in development for better DX
      // eslint-disable-next-line no-console
      console.warn(
        `Warning: Missing required environment variables: ${missingVars.join(', ')}`
      );
    }
  }
};

// Validate on module load
validateEnv();

// Parse timeout safely
const apiTimeout = Number.parseInt(requiredEnvVars.VITE_API_TIMEOUT, 10);

export const config = {
  api: {
    baseURL: requiredEnvVars.VITE_BASE_URL,
    timeout: Number.isNaN(apiTimeout) ? 10000 : apiTimeout,
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

// Optionally export individual config values for convenience
export const BASE_URL = config.api.baseURL;
export const API_TIMEOUT = config.api.timeout;
export const APP_NAME = config.app.name;
export const CURRENCY = config.app.currency;
