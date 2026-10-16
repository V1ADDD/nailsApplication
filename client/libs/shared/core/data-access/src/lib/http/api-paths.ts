export const apiPaths = {
  modules: '/api/modules',
  me: '/api/identity/me',
  notifications: '/api/identity/me/notifications',
  phoneCode: '/api/identity/me/phone/code',
  phone: '/api/identity/me/phone',
  signInCode: '/api/identity/sign-in/code',
  signIn: '/api/identity/sign-in',
  signOut: '/api/identity/sign-out',
  signOutOthers: '/api/identity/sign-out/others',
  mode: '/api/identity/mode',
  media: '/api/media',
  hub: '/api/hub',
  catalog: '/api/catalog',
  catalogSuggestions: '/api/catalog/suggestions'
} as const;
