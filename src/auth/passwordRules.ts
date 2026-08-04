/** Signup still allows 6; change-password / reset require 8. */
export const MIN_NEW_PASSWORD_LENGTH = 8;

type ValidateNewPasswordArgs = {
  newPassword: string;
  confirmPassword: string;
  currentPassword?: string;
};

/** Returns an error message, or null if valid. */
export function validateNewPassword({
  newPassword,
  confirmPassword,
  currentPassword,
}: ValidateNewPasswordArgs): string | null {
  if (currentPassword !== undefined && !currentPassword) {
    return 'Enter your current password.';
  }
  if (newPassword.length < MIN_NEW_PASSWORD_LENGTH) {
    return `New password must be at least ${MIN_NEW_PASSWORD_LENGTH} characters.`;
  }
  if (currentPassword !== undefined && newPassword === currentPassword) {
    return 'New password must be different from your current password.';
  }
  if (confirmPassword !== newPassword) {
    return 'New passwords do not match.';
  }
  return null;
}
