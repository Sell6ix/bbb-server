import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';

describe('AuthService.validate', () => {
  const originalEnv = { ...process.env };
  let prisma: { user: { findUnique: jest.Mock; create: jest.Mock } };
  let service: AuthService;

  beforeEach(() => {
    prisma = { user: { findUnique: jest.fn(), create: jest.fn() } };
    service = new AuthService(prisma as any, {} as any);
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('rejects an unknown user when registration is disabled', async () => {
    process.env.ALLOW_REGISTRATION = 'false';
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.validate('new-user', 'pw')).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('registers an unknown user as BRO when registration is allowed', async () => {
    process.env.ALLOW_REGISTRATION = 'true';
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockImplementation(async ({ data }) => ({ id: '1', ...data }));

    const user = await service.validate('new-user', 'pw');

    expect(user.role).toBe('BRO');
    expect(prisma.user.create).toHaveBeenCalledTimes(1);
  });

  it('disables registration by default in production', async () => {
    delete process.env.ALLOW_REGISTRATION;
    process.env.NODE_ENV = 'production';
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.validate('new-user', 'pw')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects a wrong password for an existing user', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: '1',
      username: 'u',
      role: 'BRO',
      passwordHash: await bcrypt.hash('right', 4),
    });

    await expect(service.validate('u', 'wrong')).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
