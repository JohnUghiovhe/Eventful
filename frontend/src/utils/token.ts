/**
 * JWT Token utility functions
 */

export interface DecodedToken {
  id?: string;
  userId?: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Decode JWT token without verification (frontend only)
 */
export const decodeToken = (token: string): DecodedToken | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeToken(token);
    if (!decoded) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Get token expiry time in seconds
 */
export const getTokenExpiryTime = (token: string): number | null => {
  try {
    const decoded = decodeToken(token);
    if (!decoded) return null;

    const currentTime = Math.floor(Date.now() / 1000);
    const expiryTime = decoded.exp - currentTime;
    return expiryTime > 0 ? expiryTime : 0;
  } catch (error) {
    return null;
  }
};

/**
 * Check if token is expiring soon (within 5 minutes)
 */
export const isTokenExpiringSoon = (token: string, minutesThreshold: number = 5): boolean => {
  const expiryTime = getTokenExpiryTime(token);
  if (expiryTime === null) return true;

  return expiryTime < minutesThreshold * 60;
};

/**
 * Validate stored token
 */
export const validateStoredToken = (): boolean => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  return !isTokenExpired(token);
};
