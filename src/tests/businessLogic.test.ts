import { describe, it, expect, beforeEach } from 'vitest';
import { 
  saveDataToLocalStorage, 
  loadDataFromLocalStorage,
} from '../contexts/DatasetContext';
import { 
  Member, 
  FitnessClass, 
  Trainer, 
  AttendanceRecord,
  MembershipPlan,
  UserProfile,
  Dataset 
} from '../types';

// Mock localStorage
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

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Test data factories
const createMockMember = (id: number, overrides: Partial<Member> = {}): Member => ({
  id,
  name: `Member ${id}`,
  email: `member${id}@example.com`,
  phone: `+44 7700 90000${id}`,
  age: 25 + id,
  gender: id % 2 === 0 ? 'Female' : 'Male',
  membershipPlanId: 1,
  startDate: '2024-01-01',
  endDate: '2025-01-01',
  status: 'Active',
  ...overrides
});

const createMockClass = (id: number, overrides: Partial<FitnessClass> = {}): FitnessClass => ({
  id,
  name: `Class ${id}`,
  trainerId: 1,
  schedule: {
    dayOfWeek: id % 7,
    startTime: '09:00',
    endTime: '10:00',
    duration: 60
  },
  capacity: 20,
  enrolled: [],
  description: `Description for class ${id}`,
  ...overrides
});

const createMockTrainer = (id: number, overrides: Partial<Trainer> = {}): Trainer => ({
  id,
  name: `Trainer ${id}`,
  email: `trainer${id}@example.com`,
  phone: `+44 7700 80000${id}`,
  expertise: ['Fitness', 'Yoga'],
  assignedClasses: [],
  hourlyRate: 50 + id * 5,
  certifications: ['Certified Trainer'],
  isActive: true,
  ...overrides
});

const createMockAttendance = (id: number, memberId: number, classId: number, overrides: Partial<AttendanceRecord> = {}): AttendanceRecord => ({
  id,
  memberId,
  classId,
  date: '2024-01-01',
  status: 'Present',
  checkedInAt: '2024-01-01T09:00:00Z',
  ...overrides
});

const createMockDataset = (overrides: Partial<Dataset> = {}): Dataset => ({
  userProfile: {
    id: 1,
    name: 'Admin User',
    email: 'admin@lotus.fit',
    phone: '+44 20 1234 5678',
    role: 'Owner',
    preferences: {
      theme: 'light',
      autoSaveInterval: 5,
      defaultView: 'dashboard'
    }
  },
  members: [],
  classes: [],
  membershipPlans: [
    {
      id: 1,
      name: 'Basic Plan',
      duration: 30,
      cost: 1500,
      description: 'Basic gym access',
      features: ['Gym Access', 'Locker Room'],
      isActive: true
    }
  ],
  trainers: [],
  attendance: [],
  ...overrides
});

describe('Business Logic Tests', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('Data Validation', () => {
    it('should validate member data structure', () => {
      const member = createMockMember(1);
      
      // Required fields
      expect(member.id).toBeDefined();
      expect(member.name).toBeTruthy();
      expect(member.email).toContain('@');
      expect(member.phone).toBeTruthy();
      expect(member.age).toBeGreaterThan(0);
      expect(['Male', 'Female', 'Other']).toContain(member.gender);
      expect(['Active', 'Expired', 'Trial', 'Suspended']).toContain(member.status);
      expect(new Date(member.startDate)).toBeInstanceOf(Date);
      expect(new Date(member.endDate)).toBeInstanceOf(Date);
    });

    it('should validate class data structure', () => {
      const fitnessClass = createMockClass(1);
      
      expect(fitnessClass.id).toBeDefined();
      expect(fitnessClass.name).toBeTruthy();
      expect(fitnessClass.trainerId).toBeDefined();
      expect(fitnessClass.schedule.dayOfWeek).toBeGreaterThanOrEqual(0);
      expect(fitnessClass.schedule.dayOfWeek).toBeLessThanOrEqual(6);
      expect(fitnessClass.schedule.startTime).toMatch(/^\d{2}:\d{2}$/);
      expect(fitnessClass.schedule.endTime).toMatch(/^\d{2}:\d{2}$/);
      expect(fitnessClass.capacity).toBeGreaterThan(0);
      expect(Array.isArray(fitnessClass.enrolled)).toBe(true);
    });

    it('should validate trainer data structure', () => {
      const trainer = createMockTrainer(1);
      
      expect(trainer.id).toBeDefined();
      expect(trainer.name).toBeTruthy();
      expect(trainer.email).toContain('@');
      expect(trainer.phone).toBeTruthy();
      expect(Array.isArray(trainer.expertise)).toBe(true);
      expect(Array.isArray(trainer.assignedClasses)).toBe(true);
      expect(Array.isArray(trainer.certifications)).toBe(true);
      expect(typeof trainer.isActive).toBe('boolean');
    });

    it('should validate attendance data structure', () => {
      const attendance = createMockAttendance(1, 1, 1);
      
      expect(attendance.id).toBeDefined();
      expect(attendance.memberId).toBeDefined();
      expect(attendance.classId).toBeDefined();
      expect(new Date(attendance.date)).toBeInstanceOf(Date);
      expect(['Present', 'Absent', 'Late']).toContain(attendance.status);
    });
  });

  describe('Business Rules', () => {
    it('should enforce member capacity limits in classes', () => {
      const fitnessClass = createMockClass(1, { capacity: 2 });
      
      // Should allow enrollment up to capacity
      expect(fitnessClass.enrolled.length).toBeLessThanOrEqual(fitnessClass.capacity);
      
      // Test enrollment logic
      const enrolledClass = { ...fitnessClass, enrolled: [1, 2] };
      expect(enrolledClass.enrolled.length).toBe(enrolledClass.capacity);
    });

    it('should handle membership expiry logic', () => {
      const today = new Date();
      const expiredMember = createMockMember(1, {
        endDate: new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Yesterday
        status: 'Expired'
      });
      
      const activeMember = createMockMember(2, {
        endDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        status: 'Active'
      });
      
      expect(new Date(expiredMember.endDate) < today).toBe(true);
      expect(new Date(activeMember.endDate) > today).toBe(true);
    });

    it('should validate class scheduling conflicts', () => {
      const class1 = createMockClass(1, {
        schedule: {
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '10:00',
          duration: 60
        }
      });
      
      const class2 = createMockClass(2, {
        schedule: {
          dayOfWeek: 1,
          startTime: '09:30',
          endTime: '10:30',
          duration: 60
        }
      });
      
      // Check for scheduling conflicts (same day, overlapping times)
      const hasConflict = class1.schedule.dayOfWeek === class2.schedule.dayOfWeek &&
        ((class1.schedule.startTime <= class2.schedule.startTime && class1.schedule.endTime > class2.schedule.startTime) ||
         (class2.schedule.startTime <= class1.schedule.startTime && class2.schedule.endTime > class1.schedule.startTime));
      
      expect(hasConflict).toBe(true);
    });

    it('should calculate membership revenue correctly', () => {
      const basicPlan = { id: 1, cost: 1500 };
      const premiumPlan = { id: 2, cost: 2500 };
      
      const members = [
        createMockMember(1, { membershipPlanId: 1, status: 'Active' }),
        createMockMember(2, { membershipPlanId: 1, status: 'Active' }),
        createMockMember(3, { membershipPlanId: 2, status: 'Active' }),
        createMockMember(4, { membershipPlanId: 1, status: 'Expired' })
      ];
      
      const activeMembers = members.filter(m => m.status === 'Active');
      const basicCount = activeMembers.filter(m => m.membershipPlanId === 1).length;
      const premiumCount = activeMembers.filter(m => m.membershipPlanId === 2).length;
      
      const totalRevenue = (basicCount * basicPlan.cost) + (premiumCount * premiumPlan.cost);
      
      expect(basicCount).toBe(2);
      expect(premiumCount).toBe(1);
      expect(totalRevenue).toBe(5500); // 2 * 1500 + 1 * 2500
    });
  });

  describe('Data Persistence', () => {
    it('should save and load complete dataset', () => {
      const originalDataset = createMockDataset({
        members: [createMockMember(1), createMockMember(2)],
        classes: [createMockClass(1)],
        trainers: [createMockTrainer(1)],
        attendance: [createMockAttendance(1, 1, 1)]
      });
      
      saveDataToLocalStorage(originalDataset);
      const loadedDataset = loadDataFromLocalStorage();
      
      expect(loadedDataset).toEqual(originalDataset);
    });

    it('should preserve data relationships after save/load', () => {
      const member = createMockMember(1);
      const trainer = createMockTrainer(1);
      const fitnessClass = createMockClass(1, { 
        trainerId: trainer.id,
        enrolled: [member.id]
      });
      const attendance = createMockAttendance(1, member.id, fitnessClass.id);
      
      const dataset = createMockDataset({
        members: [member],
        classes: [fitnessClass],
        trainers: [trainer],
        attendance: [attendance]
      });
      
      saveDataToLocalStorage(dataset);
      const loadedDataset = loadDataFromLocalStorage();
      
      // Verify relationships are preserved
      expect(loadedDataset!.classes[0].trainerId).toBe(trainer.id);
      expect(loadedDataset!.classes[0].enrolled).toContain(member.id);
      expect(loadedDataset!.attendance[0].memberId).toBe(member.id);
      expect(loadedDataset!.attendance[0].classId).toBe(fitnessClass.id);
    });

    it('should handle large datasets efficiently', () => {
      // Create a large dataset
      const members = Array.from({ length: 1000 }, (_, i) => createMockMember(i + 1));
      const classes = Array.from({ length: 50 }, (_, i) => createMockClass(i + 1));
      const trainers = Array.from({ length: 10 }, (_, i) => createMockTrainer(i + 1));
      
      const largeDataset = createMockDataset({
        members,
        classes,
        trainers
      });
      
      const startTime = performance.now();
      saveDataToLocalStorage(largeDataset);
      const saveTime = performance.now() - startTime;
      
      const loadStartTime = performance.now();
      const loadedDataset = loadDataFromLocalStorage();
      const loadTime = performance.now() - loadStartTime;
      
      expect(loadedDataset!.members).toHaveLength(1000);
      expect(loadedDataset!.classes).toHaveLength(50);
      expect(loadedDataset!.trainers).toHaveLength(10);
      
      // Performance should be reasonable (less than 1 second for this dataset)
      expect(saveTime).toBeLessThan(1000);
      expect(loadTime).toBeLessThan(1000);
    });
  });

  describe('Data Analytics', () => {
    it('should calculate membership statistics correctly', () => {
      const members = [
        createMockMember(1, { age: 20, gender: 'Male', status: 'Active' }),
        createMockMember(2, { age: 30, gender: 'Female', status: 'Active' }),
        createMockMember(3, { age: 40, gender: 'Male', status: 'Expired' }),
        createMockMember(4, { age: 50, gender: 'Other', status: 'Active' }),
      ];
      
      // Age groups
      const ageGroups = {
        '18-25': members.filter(m => m.age >= 18 && m.age <= 25).length,
        '26-35': members.filter(m => m.age >= 26 && m.age <= 35).length,
        '36-45': members.filter(m => m.age >= 36 && m.age <= 45).length,
        '46-55': members.filter(m => m.age >= 46 && m.age <= 55).length,
      };
      
      expect(ageGroups['18-25']).toBe(1);
      expect(ageGroups['26-35']).toBe(1);
      expect(ageGroups['36-45']).toBe(1);
      expect(ageGroups['46-55']).toBe(1);
      
      // Gender distribution
      const genderDistribution = {
        Male: members.filter(m => m.gender === 'Male').length,
        Female: members.filter(m => m.gender === 'Female').length,
        Other: members.filter(m => m.gender === 'Other').length,
      };
      
      expect(genderDistribution.Male).toBe(2);
      expect(genderDistribution.Female).toBe(1);
      expect(genderDistribution.Other).toBe(1);
      
      // Status distribution
      const statusDistribution = {
        Active: members.filter(m => m.status === 'Active').length,
        Expired: members.filter(m => m.status === 'Expired').length,
      };
      
      expect(statusDistribution.Active).toBe(3);
      expect(statusDistribution.Expired).toBe(1);
    });

    it('should calculate class popularity correctly', () => {
      const classes = [
        createMockClass(1, { enrolled: [1, 2, 3] }),
        createMockClass(2, { enrolled: [1, 2] }),
        createMockClass(3, { enrolled: [1] }),
        createMockClass(4, { enrolled: [] }),
      ];
      
      const popularity = classes.map(c => ({
        name: c.name,
        enrollmentCount: c.enrolled.length
      })).sort((a, b) => b.enrollmentCount - a.enrollmentCount);
      
      expect(popularity[0].enrollmentCount).toBe(3);
      expect(popularity[1].enrollmentCount).toBe(2);
      expect(popularity[2].enrollmentCount).toBe(1);
      expect(popularity[3].enrollmentCount).toBe(0);
    });

    it('should calculate attendance rates correctly', () => {
      const attendance = [
        createMockAttendance(1, 1, 1, { status: 'Present' }),
        createMockAttendance(2, 1, 1, { status: 'Absent' }),
        createMockAttendance(3, 2, 1, { status: 'Present' }),
        createMockAttendance(4, 2, 1, { status: 'Late' }),
      ];
      
      const totalRecords = attendance.length;
      const presentRecords = attendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
      const attendanceRate = (presentRecords / totalRecords) * 100;
      
      expect(totalRecords).toBe(4);
      expect(presentRecords).toBe(3); // Present + Late
      expect(attendanceRate).toBe(75);
    });
  });

  describe('Data Import/Export', () => {
    it('should handle export with metadata', () => {
      const dataset = createMockDataset({
        members: [createMockMember(1)],
        classes: [createMockClass(1)]
      });
      
      // Simulate export data creation
      const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        appVersion: '2.0.0',
        exportedBy: `${dataset.userProfile.name} (${dataset.userProfile.role})`,
        totalRecords: {
          members: dataset.members.length,
          classes: dataset.classes.length,
          trainers: dataset.trainers.length,
          membershipPlans: dataset.membershipPlans.length,
          attendanceRecords: dataset.attendance.length
        },
        ...dataset
      };
      
      expect(exportData.exportDate).toBeTruthy();
      expect(exportData.version).toBe('1.0');
      expect(exportData.totalRecords.members).toBe(1);
      expect(exportData.totalRecords.classes).toBe(1);
      expect(exportData.members).toEqual(dataset.members);
      expect(exportData.classes).toEqual(dataset.classes);
    });

    it('should handle import data validation', () => {
      const validImportData = {
        exportDate: '2024-01-01T00:00:00.000Z',
        version: '1.0',
        members: [createMockMember(1)],
        classes: [createMockClass(1)],
        membershipPlans: [],
        trainers: [],
        attendance: [],
        userProfile: createMockDataset().userProfile
      };
      
      // Validate required fields exist
      expect(validImportData.members).toBeDefined();
      expect(validImportData.classes).toBeDefined();
      expect(Array.isArray(validImportData.members)).toBe(true);
      expect(Array.isArray(validImportData.classes)).toBe(true);
      
      // Should extract only dataset fields, ignoring metadata
      const { exportDate, version, ...datasetFields } = validImportData;
      expect(datasetFields.exportDate).toBeUndefined();
      expect(datasetFields.version).toBeUndefined();
      expect(datasetFields.members).toBeDefined();
      expect(datasetFields.classes).toBeDefined();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty datasets gracefully', () => {
      const emptyDataset = createMockDataset();
      
      saveDataToLocalStorage(emptyDataset);
      const loadedDataset = loadDataFromLocalStorage();
      
      expect(loadedDataset!.members).toHaveLength(0);
      expect(loadedDataset!.classes).toHaveLength(0);
      expect(loadedDataset!.trainers).toHaveLength(0);
      expect(loadedDataset!.attendance).toHaveLength(0);
      expect(loadedDataset!.membershipPlans).toHaveLength(1); // Default plans
    });

    it('should handle corrupted localStorage gracefully', () => {
      localStorage.setItem('lotus-fitness-data', 'invalid json data');
      
      const result = loadDataFromLocalStorage();
      expect(result).toBeNull();
    });

    it('should handle missing localStorage gracefully', () => {
      const result = loadDataFromLocalStorage();
      expect(result).toBeNull();
    });

    it('should validate member age boundaries', () => {
      const youngMember = createMockMember(1, { age: 16 });
      const normalMember = createMockMember(2, { age: 25 });
      const oldMember = createMockMember(3, { age: 80 });
      
      // All ages should be valid numbers
      expect(youngMember.age).toBeGreaterThan(0);
      expect(normalMember.age).toBeGreaterThan(0);
      expect(oldMember.age).toBeGreaterThan(0);
      
      // Business rule: members should be at least 16
      const isValidAge = (age: number) => age >= 16 && age <= 100;
      expect(isValidAge(youngMember.age)).toBe(true);
      expect(isValidAge(normalMember.age)).toBe(true);
      expect(isValidAge(oldMember.age)).toBe(true);
    });
  });
});