export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const isStrongPassword = (pw) => pw.length >= 8;
