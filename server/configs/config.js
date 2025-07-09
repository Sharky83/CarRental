import joi from 'joi';

// Environment validation schema
const envSchema = joi.object({
  NODE_ENV: joi.string().valid('development', 'production', 'test').default('development'),
  PORT: joi.number().default(3000),
  MONGODB_URI: joi.string().required(),
  JWT_SECRET: joi.string().min(16).required(), // Reduced to 16 for development
  JWT_EXPIRE: joi.string().default('7d'),
  CLIENT_URL: joi.string().uri().required(),
  IMAGEKIT_PUBLIC_KEY: joi.string().required(),
  IMAGEKIT_PRIVATE_KEY: joi.string().required(),
  IMAGEKIT_URL_ENDPOINT: joi.string().uri().required(),
  BCRYPT_ROUNDS: joi.number().default(12),
  RATE_LIMIT_WINDOW: joi.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: joi.number().default(100),
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  console.log('Environment variables found:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    MONGODB_URI: process.env.MONGODB_URI ? '***SET***' : 'MISSING',
    JWT_SECRET: process.env.JWT_SECRET ? '***SET***' : 'MISSING',
    CLIENT_URL: process.env.CLIENT_URL,
    IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY ? '***SET***' : 'MISSING',
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY ? '***SET***' : 'MISSING',
    IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT,
  });
  console.log('Validation error details:', error.details);
  throw new Error(`Config validation error: ${error.message}`);
}

export default {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URI,
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_EXPIRE,
  },
  cors: {
    origin: envVars.CLIENT_URL,
  },
  imagekit: {
    publicKey: envVars.IMAGEKIT_PUBLIC_KEY,
    privateKey: envVars.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: envVars.IMAGEKIT_URL_ENDPOINT,
  },
  bcrypt: {
    rounds: envVars.BCRYPT_ROUNDS,
  },
  rateLimit: {
    windowMs: envVars.RATE_LIMIT_WINDOW,
    max: envVars.RATE_LIMIT_MAX,
  },
};
