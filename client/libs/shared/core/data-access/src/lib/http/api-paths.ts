export const apiPaths = {
  modules: '/api/modules',
  catalog: '/api/catalog',
  me: '/api/identity/me',
  signIn: '/api/identity/sign-in',
  signOut: '/api/identity/sign-out',
  register: '/api/identity/register',
  confirmEmail: '/api/identity/confirm-email',
  resendConfirmation: '/api/identity/resend-confirmation',
  forgotPassword: '/api/identity/forgot-password',
  resetPassword: '/api/identity/reset-password'
} as const;
