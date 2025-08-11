import CryptoJS from 'crypto-js';

// Default admin credentials (can be changed by user)
const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'lotus2024';

// Storage keys
const AUTH_STORAGE_KEY = 'lotus-auth-data';
const SESSION_STORAGE_KEY = 'lotus-session';

export interface AuthCredentials {
  username: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  lastLogin?: string;
  loginAttempts: number;
  lockedUntil?: string;
}

export interface SessionData {
  username: string;
  loginTime: string;
  expiresAt: string;
}

// Generate a random salt
function generateSalt(): string {
  return CryptoJS.lib.WordArray.random(32).toString();
}

// Hash password with salt
function hashPassword(password: string, salt: string): string {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: 256/32,
    iterations: 10000
  }).toString();
}

// Encrypt data for storage
function encryptData(data: any, key: string): string {
  return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
}

// Decrypt data from storage
function decryptData(encryptedData: string, key: string): any {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedData);
  } catch (error) {
    throw new Error('Failed to decrypt data');
  }
}

// Initialize auth system with default credentials if not exists
export function initializeAuth(): void {
  const existingAuth = localStorage.getItem(AUTH_STORAGE_KEY);
  
  if (!existingAuth) {
    const salt = generateSalt();
    const passwordHash = hashPassword(DEFAULT_PASSWORD, salt);
    
    const authData: AuthCredentials = {
      username: DEFAULT_USERNAME,
      passwordHash,
      salt,
      createdAt: new Date().toISOString(),
      loginAttempts: 0
    };
    
    const encryptedAuth = encryptData(authData, DEFAULT_USERNAME + DEFAULT_PASSWORD);
    localStorage.setItem(AUTH_STORAGE_KEY, encryptedAuth);
  }
}

// Get current auth credentials
function getAuthCredentials(): AuthCredentials | null {
  try {
    const encryptedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!encryptedAuth) return null;
    
    // Try to decrypt with current session credentials first
    const session = getCurrentSession();
    if (session) {
      try {
        const currentCreds = localStorage.getItem('lotus-temp-auth-key');
        if (currentCreds) {
          return decryptData(encryptedAuth, currentCreds);
        }
      } catch (error) {
        // Continue to default method
      }
    }
    
    // For initial login, try with default credentials
    try {
      return decryptData(encryptedAuth, DEFAULT_USERNAME + DEFAULT_PASSWORD);
    } catch (error) {
      // If that fails, the credentials have been changed and we need login
      return null;
    }
  } catch (error) {
    console.error('Error retrieving auth credentials:', error);
    return null;
  }
}

// Check if account is locked due to failed attempts
export function isAccountLocked(): boolean {
  const authData = getAuthCredentials();
  if (!authData) return false;
  
  if (authData.lockedUntil) {
    const lockExpiry = new Date(authData.lockedUntil);
    if (new Date() < lockExpiry) {
      return true;
    } else {
      // Lock has expired, reset attempts
      authData.lockedUntil = undefined;
      authData.loginAttempts = 0;
      updateAuthCredentials(authData);
    }
  }
  
  return false;
}

// Update auth credentials in storage
function updateAuthCredentials(authData: AuthCredentials): void {
  const session = getCurrentSession();
  const key = session ? localStorage.getItem('lotus-temp-auth-key') : authData.username + 'temp';
  
  if (key) {
    const encryptedAuth = encryptData(authData, key);
    localStorage.setItem(AUTH_STORAGE_KEY, encryptedAuth);
  }
}

// Login function
export interface LoginResult {
  success: boolean;
  message: string;
  attemptsLeft?: number;
}

export function login(username: string, password: string): LoginResult {
  if (isAccountLocked()) {
    const authData = getAuthCredentials();
    const lockExpiry = authData?.lockedUntil ? new Date(authData.lockedUntil) : new Date();
    const minutesLeft = Math.ceil((lockExpiry.getTime() - new Date().getTime()) / (1000 * 60));
    return {
      success: false,
      message: `Account locked. Try again in ${minutesLeft} minutes.`
    };
  }
  
  const authData = getAuthCredentials();
  if (!authData) {
    return {
      success: false,
      message: 'Authentication system not initialized'
    };
  }
  
  // Verify credentials
  const hashedInput = hashPassword(password, authData.salt);
  const isValidCredentials = username === authData.username && hashedInput === authData.passwordHash;
  
  if (isValidCredentials) {
    // Successful login
    authData.lastLogin = new Date().toISOString();
    authData.loginAttempts = 0;
    authData.lockedUntil = undefined;
    
    // Create session
    const sessionData: SessionData = {
      username: authData.username,
      loginTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() // 8 hours
    };
    
    // Store temporary auth key for future operations
    const tempKey = username + password;
    localStorage.setItem('lotus-temp-auth-key', tempKey);
    
    // Update auth data with new key
    updateAuthCredentials(authData);
    
    // Store session
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
    localStorage.setItem('auth', 'true'); // Keep for compatibility
    
    return {
      success: true,
      message: 'Login successful'
    };
  } else {
    // Failed login
    authData.loginAttempts += 1;
    
    if (authData.loginAttempts >= 5) {
      // Lock account for 30 minutes
      authData.lockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      updateAuthCredentials(authData);
      
      return {
        success: false,
        message: 'Too many failed attempts. Account locked for 30 minutes.'
      };
    } else {
      updateAuthCredentials(authData);
      const attemptsLeft = 5 - authData.loginAttempts;
      
      return {
        success: false,
        message: `Invalid credentials. ${attemptsLeft} attempts remaining.`,
        attemptsLeft
      };
    }
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
  localStorage.removeItem('lotus-temp-auth-key');
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
  const currentHash = hashPassword(currentPassword, authData.salt);
  if (currentHash !== authData.passwordHash) {
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
  
  // Generate new salt and hash
  const newSalt = generateSalt();
  const newHash = hashPassword(newPassword, newSalt);
  
  // Update credentials
  authData.passwordHash = newHash;
  authData.salt = newSalt;
  
  // Update storage with new key
  const newKey = authData.username + newPassword;
  localStorage.setItem('lotus-temp-auth-key', newKey);
  
  const encryptedAuth = encryptData(authData, newKey);
  localStorage.setItem(AUTH_STORAGE_KEY, encryptedAuth);
  
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
  const passwordHash = hashPassword(password, authData.salt);
  if (passwordHash !== authData.passwordHash) {
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
  const oldUsername = authData.username;
  authData.username = newUsername;
  
  // Update storage with new key
  const newKey = newUsername + password;
  localStorage.setItem('lotus-temp-auth-key', newKey);
  
  const encryptedAuth = encryptData(authData, newKey);
  localStorage.setItem(AUTH_STORAGE_KEY, encryptedAuth);
  
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

// Security utility functions
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