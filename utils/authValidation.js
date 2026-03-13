/**
 * Auth Validation Utilities
 * Pure functions to validate login and registration inputs.
 */

/**
 * Validates an email address.
 * @param {string} email 
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Validates password strength (at least 6 characters).
 * @param {string} password 
 * @returns {boolean}
 */
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Full form validation.
 * @param {string} email 
 * @param {string} password 
 * @returns {Object} { isValid, errors }
 */
export const validateAuthForm = (email, password) => {
  const errors = {};
  if (!isValidEmail(email)) {
    errors.email = "請輸入正確的 Email 格式";
  }
  if (!isValidPassword(password)) {
    errors.password = "密碼長度至少需為 6 個字元";
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
