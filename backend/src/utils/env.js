import 'dotenv/config';

function requireEnv(name, fallback = undefined) {
  const v = process.env[name] ?? fallback;
  if (v === undefined) throw new Error(`Missing env var ${name}`);
  return v;
}

export const env = {
  PORT: parseInt(process.env.PORT || '4000', 10),
  DB_HOST: requireEnv('DB_HOST'),
  DB_PORT: parseInt(process.env.DB_PORT || '3306', 10),
  DB_USER: requireEnv('DB_USER'),
  DB_PASS: requireEnv('DB_PASS'),
  DB_NAME: requireEnv('DB_NAME'),
  JWT_ACCESS_SECRET: requireEnv('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: requireEnv('JWT_REFRESH_SECRET'),
  JWT_ACCESS_EXPIRES: requireEnv('JWT_ACCESS_EXPIRES', '15m'),
  JWT_REFRESH_EXPIRES: requireEnv('JWT_REFRESH_EXPIRES', '7d'),
  REDIS_URL: requireEnv('REDIS_URL'),
  SMTP_HOST: requireEnv('SMTP_HOST'),
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: requireEnv('SMTP_USER'),
  SMTP_PASS: requireEnv('SMTP_PASS'),
  SMTP_FROM: requireEnv('SMTP_FROM')
};
