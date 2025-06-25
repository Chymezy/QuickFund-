export interface DatabaseConfig {
  url: string;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
}

export interface AppConfig {
  port: number;
  nodeEnv: string;
  name: string;
  version: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

export interface EmailConfig {
  host: string;
  user: string;
  pass: string;
}

export interface RedisConfig {
  url: string;
}

export interface SecurityConfig {
  bcryptRounds: number;
}

export interface RateLimitConfig {
  ttl: number;
  limit: number;
}

export interface Config {
  database: DatabaseConfig;
  jwt: JwtConfig;
  app: AppConfig;
  email: EmailConfig;
  redis: RedisConfig;
  security: SecurityConfig;
  rateLimit: RateLimitConfig;
}
