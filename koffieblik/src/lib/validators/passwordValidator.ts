export const validatePassword = (password: string): string | null => {
  const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
  const uppercaseRegex = /[A-Z]/;

  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!uppercaseRegex.test(password))
    return "Password must contain at least one uppercase letter";
  if (!specialCharRegex.test(password))
    return "Password must contain at least one special character";

  return null;
};
