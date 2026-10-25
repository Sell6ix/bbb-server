export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set. Copy .env.example to .env and set a long random value.');
  }
  return secret;
}

// Open registration is on by default for local development and off in production.
export function isRegistrationAllowed(): boolean {
  const flag = process.env.ALLOW_REGISTRATION;
  if (flag !== undefined) return flag === 'true';
  return process.env.NODE_ENV !== 'production';
}
