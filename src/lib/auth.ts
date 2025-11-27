// Simple authentication utilities for admin access
export const ADMIN_COOKIE_NAME = 'glb-viewer-admin-session';

export function hashPassword(password: string): string {
  // In production, use bcrypt or similar
  // This is a simple implementation for demonstration
  return Buffer.from(password).toString('base64');
}

export function verifyPassword(input: string, stored: string): boolean {
  return hashPassword(input) === stored;
}

export function createSessionToken(): string {
  return Buffer.from(
    `${Date.now()}-${Math.random().toString(36).substring(2)}`
  ).toString('base64');
}

export function isValidSession(token: string | undefined): boolean {
  if (!token) return false;
  
  // Simple validation - in production use proper session management
  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const timestamp = parseInt(decoded.split('-')[0]);
    const age = Date.now() - timestamp;
    
    // Session expires after 24 hours
    return age < 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}
