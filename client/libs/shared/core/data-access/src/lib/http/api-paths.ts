export const apiPaths = {
  modules: '/api/modules',
  me: '/api/identity/me',
  signInCode: '/api/identity/sign-in/code',
  signIn: '/api/identity/sign-in',
  signOut: '/api/identity/sign-out',
  mode: '/api/identity/mode',
  media: '/api/media',
  hub: '/api/hub',
  catalog: '/api/catalog',
  catalogSuggestions: '/api/catalog/suggestions'
} as const;
