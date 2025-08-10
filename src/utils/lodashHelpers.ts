import { 
  isEmail, 
  isEmpty, 
  trim, 
  some, 
  every, 
  find, 
  findIndex,
  groupBy,
  orderBy,
  debounce,
  throttle
} from 'lodash';
import { Member, FitnessClass } from '../types';

/**
 * Validation utilities using Lodash
 */
export class ValidationUtils {
  static isValidEmail(email: string): boolean {
    const trimmedEmail = trim(email);
    if (isEmpty(trimmedEmail)) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmedEmail.toLowerCase());
  }

  static isValidPhone(phone: string): boolean {
    const trimmedPhone = trim(phone);
    if (isEmpty(trimmedPhone)) return false;
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(trimmedPhone);
  }

  static validateRequiredFields<T extends Record<string, any>>(
    obj: T, 
    fields: (keyof T)[]
  ): { isValid: boolean; missingFields: string[] } {
    const missingFields = fields.filter(field => 
      isEmpty(trim(String(obj[field] || '')))
    );
    
    return {
      isValid: missingFields.length === 0,
      missingFields: missingFields.map(String)
    };
  }

  static sanitizeInput(input: string): string {
    return trim(input);
  }
}

/**
 * Data manipulation utilities using Lodash
 */
export class DataUtils {
  static findMemberById(members: Member[], id: number): Member | undefined {
    return find(members, { id });
  }

  static findClassById(classes: FitnessClass[], id: number): FitnessClass | undefined {
    return find(classes, { id });
  }

  static getMembersByMembershipType(members: Member[]): Record<string, Member[]> {
    return groupBy(members, 'membershipType');
  }

  static getClassesByInstructor(classes: FitnessClass[]): Record<string, FitnessClass[]> {
    return groupBy(classes, 'instructor');
  }

  static sortMembersByJoinDate(members: Member[], order: 'asc' | 'desc' = 'desc'): Member[] {
    return orderBy(members, [(member) => new Date(member.startDate)], [order]);
  }

  static sortClassesByCapacity(classes: FitnessClass[], order: 'asc' | 'desc' = 'desc'): FitnessClass[] {
    return orderBy(classes, ['capacity'], [order]);
  }

  static getAvailableClasses(classes: FitnessClass[]): FitnessClass[] {
    return classes.filter(cls => cls.enrolled.length < cls.capacity);
  }

  static getFullClasses(classes: FitnessClass[]): FitnessClass[] {
    return classes.filter(cls => cls.enrolled.length >= cls.capacity);
  }
}

/**
 * Performance utilities using Lodash
 */
export class PerformanceUtils {
  // Debounced search for better UX
  static createDebouncedSearch = (searchFn: (query: string) => void, delay = 300) => {
    return debounce(searchFn, delay);
  };

  // Throttled resize handler
  static createThrottledResize = (resizeFn: () => void, delay = 100) => {
    return throttle(resizeFn, delay);
  };

  // Memoized calculations for dashboard stats
  static memoizeCalculation = <T extends (...args: any[]) => any>(fn: T): T => {
    const cache = new Map();
    return ((...args: Parameters<T>): ReturnType<T> => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = fn(...args);
      cache.set(key, result);
      return result;
    }) as T;
  };
}

/**
 * Form utilities using Lodash
 */
export class FormUtils {
  static createFormValidator<T extends Record<string, any>>(
    requiredFields: (keyof T)[]
  ) {
    return (formData: T) => ValidationUtils.validateRequiredFields(formData, requiredFields);
  }

  static sanitizeFormData<T extends Record<string, any>>(formData: T): T {
    const sanitized = {} as T;
    for (const [key, value] of Object.entries(formData)) {
      if (typeof value === 'string') {
        (sanitized as any)[key] = ValidationUtils.sanitizeInput(value);
      } else {
        (sanitized as any)[key] = value;
      }
    }
    return sanitized;
  }
}