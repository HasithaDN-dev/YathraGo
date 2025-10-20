// Clears auth tokens and redirects to the site root (/)
export function logoutAndRedirectHome(router?: { push: (path: string) => void }) {
  try {
    // Clear cookie by setting expired cookie
    document.cookie = 'access_token=; Max-Age=0; path=/;';
  } catch {
    // noop in non-browser
  }

  try {
    localStorage.removeItem('user');
  } catch {
    // noop
  }

  // Prefer using provided router to navigate to the site root
  if (router && typeof router.push === 'function') {
    router.push('/');
    return;
  }

  // Fallback
  try {
    window.location.href = '/';
  } catch {
    // noop
  }
}
