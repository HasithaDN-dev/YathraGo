import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp: number;
  iat: number;
  [key: string]: unknown;
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: JwtPayload = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch {
    return true; // Treat invalid tokens as expired
  }
};

export const getTokenFromCookie = (): string | null => {
  if (typeof document === 'undefined') return null;
  
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('access_token='))
    ?.split('=')[1];
  
  return cookieValue || null;
};

export const checkAuthStatus = (): { isAuthenticated: boolean; token: string | null; reason?: string } => {
  const token = getTokenFromCookie();
  
  if (!token) {
    return { isAuthenticated: false, token: null, reason: 'No token found' };
  }
  
  if (isTokenExpired(token)) {
    return { isAuthenticated: false, token, reason: 'Token expired' };
  }
  
  return { isAuthenticated: true, token };
};

export const redirectToLogin = () => {
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};