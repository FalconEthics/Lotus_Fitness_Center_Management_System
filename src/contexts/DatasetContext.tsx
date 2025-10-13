import { createContext, useContext, useReducer, useMemo, ReactNode, useEffect, useState } from 'react';
import { defaults } from 'lodash';
import {
  Dataset,
  DatasetAction,
  DatasetActionType,
  DatasetContextType,
  DatasetDispatchContextType,
  Member,
  FitnessClass,
  UserProfile,
  MembershipPlan,
  Trainer,
  AttendanceRecord,
} from '../types';

// Default user profile
const defaultUserProfile: UserProfile = {
  id: 1,
  name: 'Admin User',
  email: 'admin@lotus-fitness.com',
  phone: '+91-9876543210',
  role: 'Owner',
  preferences: {
    theme: 'light',
    autoSaveInterval: 5,
    defaultView: 'dashboard',
  },
};

// Default trainers for initial setup
const defaultTrainers: Trainer[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah@lotus-fitness.com',
    phone: '+91-9876543211',
    expertise: ['Yoga', 'Pilates', 'Meditation'],
    assignedClasses: [],
    hourlyRate: 1500,
    certifications: ['200hr Yoga Teacher Training', 'Pilates Instructor'],
    isActive: true,
    hiredDate: '2023-01-15',
    experience: 8,
    bio: 'Experienced yoga instructor with a passion for holistic wellness and mindfulness.',
    rating: 4.8,
  },
  {
    id: 2,
    name: 'Mike Thompson',
    email: 'mike@lotus-fitness.com',
    phone: '+91-9876543212',
    expertise: ['HIIT', 'CrossFit', 'Strength Training'],
    assignedClasses: [],
    hourlyRate: 2000,
    certifications: ['NASM Certified', 'CrossFit Level 2'],
    isActive: true,
    hiredDate: '2023-03-20',
    experience: 12,
    bio: 'High-intensity trainer focused on functional fitness and strength development.',
    rating: 4.9,
  },
  {
    id: 3,
    name: 'Priya Sharma',
    email: 'priya@lotus-fitness.com',
    phone: '+91-9876543213',
    expertise: ['Zumba', 'Dance Fitness', 'Aerobics'],
    assignedClasses: [],
    hourlyRate: 1200,
    certifications: ['Zumba Instructor', 'Dance Fitness Certified'],
    isActive: true,
    hiredDate: '2023-06-10',
    experience: 6,
    bio: 'Energetic dance fitness instructor who brings fun and excitement to every workout.',
    rating: 4.7,
  },
  {
    id: 4,
    name: 'Raj Patel',
    email: 'raj@lotus-fitness.com',
    phone: '+91-9876543214',
    expertise: ['Boxing', 'Martial Arts', 'Cardio'],
    assignedClasses: [],
    hourlyRate: 1800,
    certifications: ['Boxing Coach', 'Kickboxing Instructor'],
    isActive: true,
    hiredDate: '2023-02-28',
    experience: 10,
    bio: 'Professional boxing coach with expertise in combat sports and self-defense.',
    rating: 4.6,
  },
];

// Initial state with all entities
export const initialState: Dataset = {
  userProfile: defaultUserProfile,
  members: [],
  classes: [],
  membershipPlans: [
    {
      id: 1,
      name: 'Basic Plan',
      duration: 30,
      cost: 1500,
      description: 'Basic gym access with standard equipment',
      features: ['Gym Access', 'Locker Room', 'Basic Equipment'],
      isActive: true,
    },
    {
      id: 2,
      name: 'Premium Plan',
      duration: 30,
      cost: 2500,
      description: 'Premium plan with personal trainer sessions',
      features: ['Gym Access', 'Personal Trainer', 'Group Classes', 'Nutrition Consultation'],
      isActive: true,
    },
    {
      id: 3,
      name: 'VIP Plan',
      duration: 30,
      cost: 5000,
      description: 'VIP access with all premium features and spa',
      features: ['All Premium Features', 'Spa Access', 'Priority Booking', 'Dietary Planning'],
      isActive: true,
    },
  ],
  trainers: defaultTrainers,
  attendance: [],
};

// Enhanced reducer with all entity operations
export function datasetReducer(state: Dataset, action: DatasetAction): Dataset {
  switch (action.type) {
    case DatasetActionType.SET_DATASET:
      return defaults({}, action.payload, initialState);

    // User Profile Actions
    case DatasetActionType.UPDATE_USER_PROFILE:
      return {
        ...state,
        userProfile: action.payload,
      };

    // Member Actions
    case DatasetActionType.ADD_MEMBER:
      return {
        ...state,
        members: [...state.members, action.payload],
      };

    case DatasetActionType.UPDATE_MEMBER: {
      return {
        ...state,
        members: state.members.map(member =>
          member.id === action.payload.id ? action.payload : member
        ),
      };
    }

    case DatasetActionType.DELETE_MEMBER: {
      const memberId = action.payload;

      return {
        ...state,
        members: state.members.filter(member => member.id !== memberId),
        classes: state.classes.map(cls => ({
          ...cls,
          enrolled: cls.enrolled.filter(id => id !== memberId),
        })),
        attendance: state.attendance.filter(record => record.memberId !== memberId),
      };
    }

    // Class Actions
    case DatasetActionType.ADD_CLASS:
      return {
        ...state,
        classes: [...state.classes, action.payload],
      };

    case DatasetActionType.UPDATE_CLASS: {
      return {
        ...state,
        classes: state.classes.map(cls =>
          cls.id === action.payload.id ? action.payload : cls
        ),
      };
    }

    case DatasetActionType.DELETE_CLASS: {
      const classId = action.payload;

      return {
        ...state,
        classes: state.classes.filter(cls => cls.id !== classId),
        attendance: state.attendance.filter(record => record.classId !== classId),
        trainers: state.trainers.map(trainer => ({
          ...trainer,
          assignedClasses: trainer.assignedClasses.filter(id => id !== classId),
        })),
      };
    }

    // Membership Plan Actions
    case DatasetActionType.ADD_MEMBERSHIP_PLAN:
      return {
        ...state,
        membershipPlans: [...state.membershipPlans, action.payload],
      };

    case DatasetActionType.UPDATE_MEMBERSHIP_PLAN: {
      return {
        ...state,
        membershipPlans: state.membershipPlans.map(plan =>
          plan.id === action.payload.id ? action.payload : plan
        ),
      };
    }

    case DatasetActionType.DELETE_MEMBERSHIP_PLAN:
      return {
        ...state,
        membershipPlans: state.membershipPlans.filter(plan => plan.id !== action.payload),
      };

    // Trainer Actions
    case DatasetActionType.ADD_TRAINER:
      return {
        ...state,
        trainers: [...state.trainers, action.payload],
      };

    case DatasetActionType.UPDATE_TRAINER: {
      return {
        ...state,
        trainers: state.trainers.map(trainer =>
          trainer.id === action.payload.id ? action.payload : trainer
        ),
      };
    }

    case DatasetActionType.DELETE_TRAINER: {
      const trainerId = action.payload;

      return {
        ...state,
        trainers: state.trainers.filter(trainer => trainer.id !== trainerId),
        classes: state.classes.map(cls =>
          cls.trainerId === trainerId ? { ...cls, trainerId: 0 } : cls
        ),
      };
    }

    // Attendance Actions
    case DatasetActionType.ADD_ATTENDANCE:
      return {
        ...state,
        attendance: [...state.attendance, action.payload],
      };

    case DatasetActionType.UPDATE_ATTENDANCE: {
      return {
        ...state,
        attendance: state.attendance.map(record =>
          record.id === action.payload.id ? action.payload : record
        ),
      };
    }

    case DatasetActionType.DELETE_ATTENDANCE:
      return {
        ...state,
        attendance: state.attendance.filter(record => record.id !== action.payload),
      };

    case DatasetActionType.IMPORT_DATA: {
      // Metadata should already be extracted by the Profile component
      // Just merge the imported data with initial state as fallback
      return defaults({}, action.payload, initialState);
    }

    case DatasetActionType.RESET_ALL_DATA:
      return initialState;

    default:
      return state;
  }
}

// Context creation with proper typing
const DatasetContext = createContext<DatasetContextType | null>(null);
const DatasetDispatchContext = createContext<DatasetDispatchContextType | null>(null);

// Provider component with auto-save functionality
interface DatasetProviderProps {
  children: ReactNode;
}

export function DatasetProvider({ children }: DatasetProviderProps) {
  const [state, dispatch] = useReducer(datasetReducer, initialState);

  // Save to localStorage immediately on any state change (except initial load)
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem('lotus-fitness-data', JSON.stringify(state));
      console.log('Data immediately saved to localStorage');
    }
  }, [state, isInitialLoad]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('lotus-fitness-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: DatasetActionType.SET_DATASET, payload: parsedData });
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      }
    }
    // Mark initial load as complete
    setIsInitialLoad(false);
  }, []);

  // Memoize the state and dispatch to prevent unnecessary re-renders
  const stateValue = useMemo<DatasetContextType>(() => state, [state]);
  const dispatchValue = useMemo<DatasetDispatchContextType>(() => dispatch, []);

  return (
    <DatasetContext.Provider value={stateValue}>
      <DatasetDispatchContext.Provider value={dispatchValue}>
        {children}
      </DatasetDispatchContext.Provider>
    </DatasetContext.Provider>
  );
}

// Custom hooks for consuming context with proper error handling
export function useDataset(): DatasetContextType {
  const context = useContext(DatasetContext);
  if (context === null) {
    throw new Error('useDataset must be used within a DatasetProvider');
  }
  return context;
}

export function useDatasetDispatch(): DatasetDispatchContextType {
  const context = useContext(DatasetDispatchContext);
  if (context === null) {
    throw new Error('useDatasetDispatch must be used within a DatasetProvider');
  }
  return context;
}

// Enhanced action creators for all entities
export const datasetActions = {
  // Dataset
  setDataset: (data: Dataset): DatasetAction => ({
    type: DatasetActionType.SET_DATASET,
    payload: data,
  }),

  // User Profile
  updateUserProfile: (userProfile: UserProfile): DatasetAction => ({
    type: DatasetActionType.UPDATE_USER_PROFILE,
    payload: userProfile,
  }),
  
  // Members
  addMember: (member: Member): DatasetAction => ({
    type: DatasetActionType.ADD_MEMBER,
    payload: member,
  }),
  
  updateMember: (member: Member): DatasetAction => ({
    type: DatasetActionType.UPDATE_MEMBER,
    payload: member,
  }),
  
  deleteMember: (memberId: number): DatasetAction => ({
    type: DatasetActionType.DELETE_MEMBER,
    payload: memberId,
  }),
  
  // Classes
  addClass: (classData: FitnessClass): DatasetAction => ({
    type: DatasetActionType.ADD_CLASS,
    payload: classData,
  }),
  
  updateClass: (classData: FitnessClass): DatasetAction => ({
    type: DatasetActionType.UPDATE_CLASS,
    payload: classData,
  }),
  
  deleteClass: (classId: number): DatasetAction => ({
    type: DatasetActionType.DELETE_CLASS,
    payload: classId,
  }),

  // Membership Plans
  addMembershipPlan: (plan: MembershipPlan): DatasetAction => ({
    type: DatasetActionType.ADD_MEMBERSHIP_PLAN,
    payload: plan,
  }),

  updateMembershipPlan: (plan: MembershipPlan): DatasetAction => ({
    type: DatasetActionType.UPDATE_MEMBERSHIP_PLAN,
    payload: plan,
  }),

  deleteMembershipPlan: (planId: number): DatasetAction => ({
    type: DatasetActionType.DELETE_MEMBERSHIP_PLAN,
    payload: planId,
  }),

  // Trainers
  addTrainer: (trainer: Trainer): DatasetAction => ({
    type: DatasetActionType.ADD_TRAINER,
    payload: trainer,
  }),

  updateTrainer: (trainer: Trainer): DatasetAction => ({
    type: DatasetActionType.UPDATE_TRAINER,
    payload: trainer,
  }),

  deleteTrainer: (trainerId: number): DatasetAction => ({
    type: DatasetActionType.DELETE_TRAINER,
    payload: trainerId,
  }),

  // Attendance
  addAttendance: (attendance: AttendanceRecord): DatasetAction => ({
    type: DatasetActionType.ADD_ATTENDANCE,
    payload: attendance,
  }),

  updateAttendance: (attendance: AttendanceRecord): DatasetAction => ({
    type: DatasetActionType.UPDATE_ATTENDANCE,
    payload: attendance,
  }),

  deleteAttendance: (attendanceId: number): DatasetAction => ({
    type: DatasetActionType.DELETE_ATTENDANCE,
    payload: attendanceId,
  }),

  // Import/Reset data
  importData: (data: any): DatasetAction => ({
    type: DatasetActionType.IMPORT_DATA,
    payload: data,
  }),

  resetAllData: (): DatasetAction => ({
    type: DatasetActionType.RESET_ALL_DATA,
  }),
};

// Selector hooks - optimized to return direct references
export function useUserProfile(): UserProfile {
  const { userProfile } = useDataset();
  return userProfile;
}

export function useMembers(): Member[] {
  const { members } = useDataset();
  return members;
}

export function useClasses(): FitnessClass[] {
  const { classes } = useDataset();
  return classes;
}

export function useMembershipPlans(): MembershipPlan[] {
  const { membershipPlans } = useDataset();
  return membershipPlans;
}

export function useTrainers(): Trainer[] {
  const { trainers } = useDataset();
  return trainers;
}

export function useAttendance(): AttendanceRecord[] {
  const { attendance } = useDataset();
  return attendance;
}

// Entity-specific selector hooks
export function useMemberById(id: number): Member | undefined {
  const { members } = useDataset();
  return useMemo(
    () => members.find(member => member.id === id),
    [members, id]
  );
}

export function useClassById(id: number): FitnessClass | undefined {
  const { classes } = useDataset();
  return useMemo(
    () => classes.find(cls => cls.id === id),
    [classes, id]
  );
}

export function useTrainerById(id: number): Trainer | undefined {
  const { trainers } = useDataset();
  return useMemo(
    () => trainers.find(trainer => trainer.id === id),
    [trainers, id]
  );
}

export function useMembershipPlanById(id: number): MembershipPlan | undefined {
  const { membershipPlans } = useDataset();
  return useMemo(
    () => membershipPlans.find(plan => plan.id === id),
    [membershipPlans, id]
  );
}

// Utility functions for data management
export function saveDataToLocalStorage(data: Dataset): void {
  localStorage.setItem('lotus-fitness-data', JSON.stringify(data));
}

export function loadDataFromLocalStorage(): Dataset | null {
  const savedData = localStorage.getItem('lotus-fitness-data');
  if (savedData) {
    try {
      return JSON.parse(savedData);
    } catch (error) {
      console.error('Error parsing localStorage data:', error);
      return null;
    }
  }
  return null;
}

export function exportDataAsJSON(data: Dataset): void {
  const exportData = {
    exportDate: new Date().toISOString(),
    version: "1.0",
    appVersion: "2.0.0", 
    exportedBy: `${data.userProfile.name} (${data.userProfile.role})`,
    totalRecords: {
      members: data.members.length,
      classes: data.classes.length,
      trainers: data.trainers.length,
      membershipPlans: data.membershipPlans.length,
      attendanceRecords: data.attendance.length
    },
    ...data
  };
  
  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `lotus-fitness-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}