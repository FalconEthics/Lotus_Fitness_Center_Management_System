// Simple auth system for portfolio CRUD demo
// Note: This is client-side only - not production secure!

// Default admin credentials (can be changed by user)
const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'lotus2024';

// Storage keys
const AUTH_STORAGE_KEY = 'lotus-auth-data';
const SESSION_STORAGE_KEY = 'lotus-session';

export interface AuthCredentials {
  username: string;
  password: string;
  createdAt: string;
  lastLogin?: string;
}

export interface SessionData {
  username: string;
  loginTime: string;
  expiresAt: string;
}

// Initialize auth system with default credentials if not exists
export function initializeAuth(): void {
  const existingAuth = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!existingAuth) {
    const authData: AuthCredentials = {
      username: DEFAULT_USERNAME,
      password: DEFAULT_PASSWORD,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
  }
}

// Get current auth credentials
function getAuthCredentials(): AuthCredentials | null {
  try {
    const authStr = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!authStr) {
      initializeAuth();
      const newAuthStr = localStorage.getItem(AUTH_STORAGE_KEY);
      return newAuthStr ? JSON.parse(newAuthStr) : null;
    }

    return JSON.parse(authStr);
  } catch (error) {
    console.error('Error retrieving auth credentials:', error);
    // Reinitialize on corrupted data
    localStorage.removeItem(AUTH_STORAGE_KEY);
    initializeAuth();
    const authStr = localStorage.getItem(AUTH_STORAGE_KEY);
    return authStr ? JSON.parse(authStr) : null;
  }
}

// Update auth credentials in storage
function updateAuthCredentials(authData: AuthCredentials): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
}

// Login function
export interface LoginResult {
  success: boolean;
  message: string;
}

export function login(username: string, password: string): LoginResult {
  const authData = getAuthCredentials();
  if (!authData) {
    return {
      success: false,
      message: 'Authentication system not initialized'
    };
  }

  // Verify credentials
  const isValidCredentials = username === authData.username && password === authData.password;

  if (isValidCredentials) {
    // Successful login
    authData.lastLogin = new Date().toISOString();
    updateAuthCredentials(authData);

    // Create session
    const sessionData: SessionData = {
      username: authData.username,
      loginTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() // 8 hours
    };

    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
    localStorage.setItem('auth', 'true');

    return {
      success: true,
      message: 'Login successful'
    };
  } else {
    return {
      success: false,
      message: 'Invalid username or password'
    };
  }
}

// Get current session
export function getCurrentSession(): SessionData | null {
  try {
    const sessionStr = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionStr) return null;

    const session: SessionData = JSON.parse(sessionStr);

    // Check if session is expired
    if (new Date() > new Date(session.expiresAt)) {
      logout();
      return null;
    }

    return session;
  } catch (error) {
    return null;
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  const session = getCurrentSession();
  return session !== null && localStorage.getItem('auth') === 'true';
}

// Logout function
export function logout(): void {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
  localStorage.removeItem('auth');
}

// Change password function
export interface PasswordChangeResult {
  success: boolean;
  message: string;
}

export function changePassword(currentPassword: string, newPassword: string): PasswordChangeResult {
  const session = getCurrentSession();
  if (!session) {
    return {
      success: false,
      message: 'Not authenticated'
    };
  }

  const authData = getAuthCredentials();
  if (!authData) {
    return {
      success: false,
      message: 'Authentication data not found'
    };
  }

  // Verify current password
  if (currentPassword !== authData.password) {
    return {
      success: false,
      message: 'Current password is incorrect'
    };
  }

  // Validate new password
  if (newPassword.length < 8) {
    return {
      success: false,
      message: 'New password must be at least 8 characters long'
    };
  }

  if (newPassword === currentPassword) {
    return {
      success: false,
      message: 'New password must be different from current password'
    };
  }

  // Update password
  authData.password = newPassword;
  updateAuthCredentials(authData);

  return {
    success: true,
    message: 'Password changed successfully'
  };
}

// Change username function
export interface UsernameChangeResult {
  success: boolean;
  message: string;
}

export function changeUsername(password: string, newUsername: string): UsernameChangeResult {
  const session = getCurrentSession();
  if (!session) {
    return {
      success: false,
      message: 'Not authenticated'
    };
  }

  const authData = getAuthCredentials();
  if (!authData) {
    return {
      success: false,
      message: 'Authentication data not found'
    };
  }

  // Verify password
  if (password !== authData.password) {
    return {
      success: false,
      message: 'Password is incorrect'
    };
  }

  // Validate new username
  if (newUsername.length < 3) {
    return {
      success: false,
      message: 'Username must be at least 3 characters long'
    };
  }

  if (newUsername === authData.username) {
    return {
      success: false,
      message: 'New username must be different from current username'
    };
  }

  // Update username
  authData.username = newUsername;
  updateAuthCredentials(authData);

  // Update session
  const newSession: SessionData = {
    ...session,
    username: newUsername
  };
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));

  return {
    success: true,
    message: 'Username changed successfully'
  };
}

// Get current username
export function getCurrentUsername(): string | null {
  const session = getCurrentSession();
  return session?.username || null;
}

// Password strength validation (for UI feedback)
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else feedback.push('Use at least 8 characters');

  if (password.length >= 12) score += 1;

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Include lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Include uppercase letters');

  if (/\d/.test(password)) score += 1;
  else feedback.push('Include numbers');

  if (/[^a-zA-Z\d]/.test(password)) score += 1;
  else feedback.push('Include special characters');

  return {
    isValid: score >= 4,
    score,
    feedback
  };
}
