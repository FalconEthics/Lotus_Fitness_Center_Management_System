import { describe, it, expect, beforeEach } from 'vitest';
import { DatasetActionType } from '../types';
import { 
  saveDataToLocalStorage, 
  loadDataFromLocalStorage,
  exportDataAsJSON,
} from '../contexts/DatasetContext';
import { datasetReducer, initialState } from '../contexts/DatasetContext';

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

// Mock URL and document for export functionality
global.URL = {
  createObjectURL: () => 'mock-url',
  revokeObjectURL: () => {},
} as any;

// Test data
const mockMember = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+44 7700 900001',
  age: 30,
  gender: 'Male' as const,
  membershipPlanId: 1,
  startDate: '2024-01-01',
  endDate: '2025-01-01',
  status: 'Active' as const
};

const mockClass = {
  id: 1,
  name: 'Yoga Class',
  trainerId: 1,
  schedule: {
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '10:00',
    duration: 60
  },
  capacity: 20,
  enrolled: [1],
  description: 'Relaxing yoga session'
};

const mockTrainer = {
  id: 1,
  name: 'Jane Smith',
  email: 'jane@example.com',
  phone: '+44 7700 900002',
  expertise: ['Yoga', 'Pilates'],
  assignedClasses: [1],
  hourlyRate: 50,
  certifications: ['Certified Yoga Instructor'],
  isActive: true
};

const mockAttendance = {
  id: 1,
  memberId: 1,
  classId: 1,
  date: '2024-01-01',
  status: 'Present' as const,
  checkedInAt: '2024-01-01T09:00:00Z'
};

describe('Data Management', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('Local Storage Operations', () => {
    it('should save data to localStorage', () => {
      const testData = {
        ...initialState,
        members: [mockMember]
      };

      saveDataToLocalStorage(testData);
      
      const savedData = localStorage.getItem('lotus-fitness-data');
      expect(savedData).toBeTruthy();
      
      const parsedData = JSON.parse(savedData!);
      expect(parsedData.members).toHaveLength(1);
      expect(parsedData.members[0]).toEqual(mockMember);
    });

    it('should load data from localStorage', () => {
      const testData = {
        ...initialState,
        members: [mockMember]
      };

      localStorage.setItem('lotus-fitness-data', JSON.stringify(testData));
      
      const loadedData = loadDataFromLocalStorage();
      expect(loadedData).toEqual(testData);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('lotus-fitness-data', 'corrupted data');
      
      const loadedData = loadDataFromLocalStorage();
      expect(loadedData).toBeNull();
    });

    it('should return null when no data in localStorage', () => {
      const loadedData = loadDataFromLocalStorage();
      expect(loadedData).toBeNull();
    });
  });

  describe('Dataset Reducer', () => {
    it('should handle SET_DATASET action', () => {
      const newData = {
        ...initialState,
        members: [mockMember]
      };

      const action = {
        type: DatasetActionType.SET_DATASET,
        payload: newData
      };

      const result = datasetReducer(initialState, action);
      expect(result.members).toHaveLength(1);
      expect(result.members[0]).toEqual(mockMember);
    });

    it('should handle ADD_MEMBER action', () => {
      const action = {
        type: DatasetActionType.ADD_MEMBER,
        payload: mockMember
      };

      const result = datasetReducer(initialState, action);
      expect(result.members).toHaveLength(1);
      expect(result.members[0]).toEqual(mockMember);
    });

    it('should handle UPDATE_MEMBER action', () => {
      const stateWithMember = {
        ...initialState,
        members: [mockMember]
      };

      const updatedMember = {
        ...mockMember,
        name: 'John Updated',
        age: 31
      };

      const action = {
        type: DatasetActionType.UPDATE_MEMBER,
        payload: updatedMember
      };

      const result = datasetReducer(stateWithMember, action);
      expect(result.members[0].name).toBe('John Updated');
      expect(result.members[0].age).toBe(31);
    });

    it('should handle DELETE_MEMBER action', () => {
      const stateWithMember = {
        ...initialState,
        members: [mockMember]
      };

      const action = {
        type: DatasetActionType.DELETE_MEMBER,
        payload: mockMember.id
      };

      const result = datasetReducer(stateWithMember, action);
      expect(result.members).toHaveLength(0);
    });

    it('should handle ADD_CLASS action', () => {
      const action = {
        type: DatasetActionType.ADD_CLASS,
        payload: mockClass
      };

      const result = datasetReducer(initialState, action);
      expect(result.classes).toHaveLength(1);
      expect(result.classes[0]).toEqual(mockClass);
    });

    it('should handle UPDATE_CLASS action', () => {
      const stateWithClass = {
        ...initialState,
        classes: [mockClass]
      };

      const updatedClass = {
        ...mockClass,
        name: 'Advanced Yoga',
        capacity: 15
      };

      const action = {
        type: DatasetActionType.UPDATE_CLASS,
        payload: updatedClass
      };

      const result = datasetReducer(stateWithClass, action);
      expect(result.classes[0].name).toBe('Advanced Yoga');
      expect(result.classes[0].capacity).toBe(15);
    });

    it('should handle DELETE_CLASS action and clean up references', () => {
      const stateWithClassAndTrainer = {
        ...initialState,
        classes: [mockClass],
        trainers: [mockTrainer],
        attendance: [mockAttendance]
      };

      const action = {
        type: DatasetActionType.DELETE_CLASS,
        payload: mockClass.id
      };

      const result = datasetReducer(stateWithClassAndTrainer, action);
      expect(result.classes).toHaveLength(0);
      expect(result.attendance).toHaveLength(0); // Should remove attendance for deleted class
      expect(result.trainers[0].assignedClasses).toHaveLength(0); // Should remove from trainer's assigned classes
    });

    it('should handle ADD_TRAINER action', () => {
      const action = {
        type: DatasetActionType.ADD_TRAINER,
        payload: mockTrainer
      };

      const result = datasetReducer(initialState, action);
      expect(result.trainers).toHaveLength(1);
      expect(result.trainers[0]).toEqual(mockTrainer);
    });

    it('should handle DELETE_TRAINER action and update class references', () => {
      const stateWithTrainerAndClass = {
        ...initialState,
        trainers: [mockTrainer],
        classes: [mockClass]
      };

      const action = {
        type: DatasetActionType.DELETE_TRAINER,
        payload: mockTrainer.id
      };

      const result = datasetReducer(stateWithTrainerAndClass, action);
      expect(result.trainers).toHaveLength(0);
      expect(result.classes[0].trainerId).toBe(0); // Should set to unassigned
    });

    it('should handle DELETE_MEMBER action and clean up all references', () => {
      const stateWithAll = {
        ...initialState,
        members: [mockMember],
        classes: [mockClass],
        attendance: [mockAttendance]
      };

      const action = {
        type: DatasetActionType.DELETE_MEMBER,
        payload: mockMember.id
      };

      const result = datasetReducer(stateWithAll, action);
      expect(result.members).toHaveLength(0);
      expect(result.classes[0].enrolled).toHaveLength(0); // Should remove from class enrollment
      expect(result.attendance).toHaveLength(0); // Should remove attendance records
    });

    it('should handle IMPORT_DATA action', () => {
      const importData = {
        ...initialState,
        members: [mockMember],
        classes: [mockClass],
        exportDate: '2024-01-01',
        version: '1.0'
      };

      const action = {
        type: DatasetActionType.IMPORT_DATA,
        payload: importData
      };

      const result = datasetReducer(initialState, action);
      expect(result.members).toHaveLength(1);
      expect(result.classes).toHaveLength(1);
      // Should not include metadata
      expect((result as any).exportDate).toBeUndefined();
      expect((result as any).version).toBeUndefined();
    });

    it('should handle RESET_ALL_DATA action', () => {
      const stateWithData = {
        ...initialState,
        members: [mockMember],
        classes: [mockClass],
        trainers: [mockTrainer],
        attendance: [mockAttendance]
      };

      const action = {
        type: DatasetActionType.RESET_ALL_DATA
      };

      const result = datasetReducer(stateWithData, action);
      expect(result).toEqual(initialState);
    });

    it('should return unchanged state for unknown actions', () => {
      const unknownAction = {
        type: 'UNKNOWN_ACTION' as any,
        payload: {}
      };

      const result = datasetReducer(initialState, unknownAction);
      expect(result).toBe(initialState);
    });
  });

  describe('Data Export', () => {
    it('should create export data with metadata', () => {
      const testData = {
        ...initialState,
        members: [mockMember],
        classes: [mockClass]
      };

      // Mock document.createElement and related methods
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      };

      const mockAppendChild = vi.fn();
      const mockRemoveChild = vi.fn();

      global.document = {
        createElement: vi.fn(() => mockLink),
        body: {
          appendChild: mockAppendChild,
          removeChild: mockRemoveChild
        }
      } as any;

      global.Blob = vi.fn() as any;

      exportDataAsJSON(testData);

      // Verify that export functionality was called
      expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
      expect(mockLink.download).toContain('lotus-fitness-backup');
    });
  });

  describe('Data Integrity', () => {
    it('should maintain referential integrity when deleting members', () => {
      const member2 = { ...mockMember, id: 2 };
      const classWithBothMembers = {
        ...mockClass,
        enrolled: [1, 2]
      };
      const attendance2 = {
        ...mockAttendance,
        id: 2,
        memberId: 2
      };

      const stateWithMultipleMembers = {
        ...initialState,
        members: [mockMember, member2],
        classes: [classWithBothMembers],
        attendance: [mockAttendance, attendance2]
      };

      const action = {
        type: DatasetActionType.DELETE_MEMBER,
        payload: 1 // Delete first member
      };

      const result = datasetReducer(stateWithMultipleMembers, action);
      
      // Should remove only the deleted member
      expect(result.members).toHaveLength(1);
      expect(result.members[0].id).toBe(2);
      
      // Should remove member from class enrollment
      expect(result.classes[0].enrolled).toEqual([2]);
      
      // Should remove only attendance records for deleted member
      expect(result.attendance).toHaveLength(1);
      expect(result.attendance[0].memberId).toBe(2);
    });

    it('should handle edge cases in data operations', () => {
      // Try to update non-existent member
      const updateAction = {
        type: DatasetActionType.UPDATE_MEMBER,
        payload: { ...mockMember, id: 999 }
      };

      const result = datasetReducer(initialState, updateAction);
      expect(result.members).toHaveLength(0); // Should not add member if it doesn't exist

      // Try to delete non-existent member
      const deleteAction = {
        type: DatasetActionType.DELETE_MEMBER,
        payload: 999
      };

      const result2 = datasetReducer(initialState, deleteAction);
      expect(result2).toEqual(initialState); // Should not change state
    });
  });
});