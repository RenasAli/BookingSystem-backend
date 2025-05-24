import validatePassword from '../../src/util/validatePassword';

describe('Unit: validatePassword', () => {
  // ✅ Gyldige adgangskoder
  it('should pass for a valid password with uppercase, lowercase, and number', () => {
    expect(() => validatePassword('Password1')).not.toThrow();
  });

  it('should pass for longer valid password', () => {
    expect(() => validatePassword('MySecurePass123')).not.toThrow();
  });

  // ❌ Ugyldige adgangskoder
  it('should throw if password is less than 8 characters', () => {
    expect(() => validatePassword('P1a')).toThrow(
      'Password must be at least 8 characters long and include uppercase, lowercase, and a number.'
    );
  });

  it('should throw if password has no uppercase letter', () => {
    expect(() => validatePassword('password1')).toThrow(
      'Password must be at least 8 characters long and include uppercase, lowercase, and a number.'
    );
  });

  it('should throw if password has no lowercase letter', () => {
    expect(() => validatePassword('PASSWORD1')).toThrow(
      'Password must be at least 8 characters long and include uppercase, lowercase, and a number.'
    );
  });

  it('should throw if password has no number', () => {
    expect(() => validatePassword('Password')).toThrow(
      'Password must be at least 8 characters long and include uppercase, lowercase, and a number.'
    );
  });

  // Edge cases
  it('should throw if password is empty string', () => {
    expect(() => validatePassword('')).toThrow();
  });

  it('should throw if password is only numbers', () => {
    expect(() => validatePassword('12345678')).toThrow();
  });

  it('should throw if password is only letters', () => {
    expect(() => validatePassword('Password')).toThrow();
  });

  it('should throw if password is only special characters', () => {
    expect(() => validatePassword('!@#$%^&*')).toThrow();
  });

  it('should pass for password with special characters and valid rules', () => {
    expect(() => validatePassword('Password1!')).not.toThrow();
  });
});
