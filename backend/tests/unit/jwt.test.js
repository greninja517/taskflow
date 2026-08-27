const { signToken, verifyToken } = require('../../src/utils/jwt');

describe('jwt utils', () => {
  it('signs and verifies a token', () => {
    const token = signToken({ userId: 42 });
    const payload = verifyToken(token);
    expect(payload.userId).toBe(42);
  });

  it('throws on an invalid token', () => {
    expect(() => verifyToken('not-a-real-token')).toThrow();
  });
});
