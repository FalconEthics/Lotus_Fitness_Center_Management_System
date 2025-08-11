import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  initializeAuth,
  login,
  logout,
  changePassword,
  changeUsername,
  validatePasswordStrength,
  getCurrentUsername,
  isAuthenticated,
  isAccountLocked
} from '../utils/auth';

// Mock localStorage and sessionStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

const sessionStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

// Replace global localStorage and sessionStorage
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

describe('Authentication System', () => {
  beforeEach(() => {
    localStorageMock.clear();
    sessionStorageMock.clear();
  });

  afterEach(() => {
    logout();
    localStorageMock.clear();
    sessionStorageMock.clear();
  });

  describe('Initialization', () => {
    it('should initialize auth system with default credentials', () => {
      initializeAuth();
      
      const authData = localStorage.getItem('lotus-auth-data');
      expect(authData).toBeTruthy();
    });

    it('should not overwrite existing auth data', () => {
      initializeAuth();
      const firstAuthData = localStorage.getItem('lotus-auth-data');
      
      initializeAuth();
      const secondAuthData = localStorage.getItem('lotus-auth-data');
      
      expect(firstAuthData).toBe(secondAuthData);
    });
  });

  describe('Login', () => {
    beforeEach(() => {
      initializeAuth();
    });

    it('should login with correct default credentials', () => {
      const result = login('admin', 'lotus2024');
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Login successful');
      expect(isAuthenticated()).toBe(true);
    });

    it('should fail login with incorrect username', () => {
      const result = login('wronguser', 'lotus2024');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid credentials');
      expect(isAuthenticated()).toBe(false);
    });

    it('should fail login with incorrect password', () => {
      const result = login('admin', 'wrongpassword');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid credentials');
      expect(isAuthenticated()).toBe(false);
    });

    it('should track failed login attempts', () => {
      login('admin', 'wrongpassword');
      const result = login('admin', 'wrongpassword');
      
      expect(result.attemptsLeft).toBe(3);
    });

    it('should lock account after 5 failed attempts', () => {
      // Make 5 failed attempts
      for (let i = 0; i < 5; i++) {
        login('admin', 'wrongpassword');
      }
      
      expect(isAccountLocked()).toBe(true);
      
      const result = login('admin', 'lotus2024');
      expect(result.success).toBe(false);
      expect(result.message).toContain('locked');
    });

    it('should reset attempts after successful login', () => {
      // Make 2 failed attempts
      login('admin', 'wrongpassword');
      login('admin', 'wrongpassword');
      
      // Successful login
      const result = login('admin', 'lotus2024');
      expect(result.success).toBe(true);
      
      // Logout and make another failed attempt - should start fresh
      logout();
      const failResult = login('admin', 'wrongpassword');
      expect(failResult.attemptsLeft).toBe(4);
    });
  });

  describe('Password Management', () => {
    beforeEach(() => {
      initializeAuth();
      login('admin', 'lotus2024');
    });

    it('should validate password strength correctly', () => {
      const weak = validatePasswordStrength('123');
      expect(weak.isValid).toBe(false);
      expect(weak.score).toBeLessThan(4);
      expect(weak.feedback.length).toBeGreaterThan(0);

      const strong = validatePasswordStrength('StrongP@ss123!');
      expect(strong.isValid).toBe(true);
      expect(strong.score).toBeGreaterThanOrEqual(4);
    });

    it('should change password with valid current password', () => {
      const result = changePassword('lotus2024', 'NewP@ssword123!');
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Password changed successfully');
    });

    it('should fail to change password with incorrect current password', () => {
      const result = changePassword('wrongpassword', 'NewP@ssword123!');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Current password is incorrect');
    });

    it('should fail to change password if new password is weak', () => {
      const result = changePassword('lotus2024', '123');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('at least 8 characters');
    });

    it('should fail to change password if new password is same as current', () => {
      const result = changePassword('lotus2024', 'lotus2024');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('New password must be different from current password');
    });

    it('should allow login with new password after change', () => {
      // Change password
      changePassword('lotus2024', 'NewP@ssword123!');
      logout();
      
      // Login with new password
      const result = login('admin', 'NewP@ssword123!');
      expect(result.success).toBe(true);
    });
  });

  describe('Username Management', () => {
    beforeEach(() => {
      initializeAuth();
      login('admin', 'lotus2024');
    });

    it('should change username with valid password', () => {
      const result = changeUsername('lotus2024', 'newadmin');
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Username changed successfully');
      expect(getCurrentUsername()).toBe('newadmin');
    });

    it('should fail to change username with incorrect password', () => {
      const result = changeUsername('wrongpassword', 'newadmin');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Password is incorrect');
    });

    it('should fail to change username if too short', () => {
      const result = changeUsername('lotus2024', 'ab');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('at least 3 characters');
    });

    it('should fail to change username if same as current', () => {
      const result = changeUsername('lotus2024', 'admin');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('New username must be different from current username');
    });

    it('should allow login with new username after change', () => {
      // Change username
      changeUsername('lotus2024', 'newadmin');
      logout();
      
      // Login with new username
      const result = login('newadmin', 'lotus2024');
      expect(result.success).toBe(true);
    });
  });

  describe('Session Management', () => {
    beforeEach(() => {
      initializeAuth();
    });

    it('should create session on successful login', () => {
      login('admin', 'lotus2024');
      
      const sessionData = sessionStorage.getItem('lotus-session');
      expect(sessionData).toBeTruthy();
      expect(isAuthenticated()).toBe(true);
    });

    it('should get current username from session', () => {
      login('admin', 'lotus2024');
      
      const username = getCurrentUsername();
      expect(username).toBe('admin');
    });

    it('should clear session on logout', () => {
      login('admin', 'lotus2024');
      expect(isAuthenticated()).toBe(true);
      
      logout();
      expect(isAuthenticated()).toBe(false);
      expect(getCurrentUsername()).toBeNull();
    });

    it('should handle expired sessions gracefully', () => {
      login('admin', 'lotus2024');
      
      // Manually expire the session
      const expiredSession = JSON.stringify({
        username: 'admin',
        loginTime: new Date().toISOString(),
        expiresAt: new Date(Date.now() - 1000).toISOString() // Expired 1 second ago
      });
      sessionStorage.setItem('lotus-session', expiredSession);
      
      expect(isAuthenticated()).toBe(false);
    });
  });

  describe('Security Features', () => {
    beforeEach(() => {
      initializeAuth();
    });

    it('should not be authenticated without valid session', () => {
      expect(isAuthenticated()).toBe(false);
    });

    it('should handle corrupted auth data gracefully', () => {
      localStorage.setItem('lotus-auth-data', 'corrupted data');
      
      const result = login('admin', 'lotus2024');
      expect(result.success).toBe(false);
    });

    it('should handle corrupted session data gracefully', () => {
      login('admin', 'lotus2024');
      sessionStorage.setItem('lotus-session', 'corrupted data');
      
      expect(isAuthenticated()).toBe(false);
    });

    it('should store passwords securely (no plain text)', () => {
      const authData = localStorage.getItem('lotus-auth-data');
      expect(authData).not.toContain('lotus2024');
      expect(authData).not.toContain('admin');
    });
  });
});