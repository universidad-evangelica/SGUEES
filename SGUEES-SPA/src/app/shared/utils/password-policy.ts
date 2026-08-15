export interface PasswordPolicyCheck {
  isValid: boolean;
  message: string;
  hasMinLength: boolean;
  hasNumbers: boolean;
  hasLetters: boolean;
  hasSpecial: boolean;
  score: number;
}

export function evaluatePasswordPolicy(password: string): PasswordPolicyCheck {
  const value = `${password ?? ''}`;
  const hasMinLength = value.length >= 8;
  const hasNumbers = /\d/.test(value);
  const hasLetters = /[a-zA-Z]/.test(value);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value);

  if (!hasMinLength) {
    return {
      isValid: false,
      message: 'Mínimo 8 caracteres requeridos',
      hasMinLength,
      hasNumbers,
      hasLetters,
      hasSpecial,
      score: 0,
    };
  }

  if (!hasNumbers) {
    return {
      isValid: false,
      message: 'Debe contener números (0-9)',
      hasMinLength,
      hasNumbers,
      hasLetters,
      hasSpecial,
      score: 1,
    };
  }

  if (!hasLetters) {
    return {
      isValid: false,
      message: 'Debe contener letras (A-Z)',
      hasMinLength,
      hasNumbers,
      hasLetters,
      hasSpecial,
      score: 1,
    };
  }

  return {
    isValid: true,
    message: hasSpecial ? 'Contraseña fuerte' : 'Contraseña válida',
    hasMinLength,
    hasNumbers,
    hasLetters,
    hasSpecial,
    score: hasSpecial ? 3 : 2,
  };
}

export function passwordsMatch(password: string, confirm: string): boolean {
  return `${password ?? ''}` === `${confirm ?? ''}` && `${password ?? ''}`.length > 0;
}
