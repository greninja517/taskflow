const { hashPassword, comparePassword } = require('../../src/utils/password');

describe('password utils', () => {
  it('hashes a password and can verify it later', async () => {
    const hash = await hashPassword('supersecret');
    expect(hash).not.toBe('supersecret');
    expect(await comparePassword('supersecret', hash)).toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await hashPassword('supersecret');
    expect(await comparePassword('wrong-password', hash)).toBe(false);
  });
});
