import { createContext, useContext, useReducer, useMemo, ReactNode, useEffect } from 'react';
import { cloneDeep, findIndex, reject, defaults } from 'lodash';
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

// Initial state with all entities
const initialState: Dataset = {
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
  trainers: [],
  attendance: [],
};

// Enhanced reducer with all entity operations
function datasetReducer(state: Dataset, action: DatasetAction): Dataset {
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
      const newState = cloneDeep(state);
      const memberIndex = findIndex(newState.members, { id: action.payload.id });
      if (memberIndex !== -1) {
        newState.members[memberIndex] = action.payload;
      }
      return newState;
    }

    case DatasetActionType.DELETE_MEMBER: {
      const memberId = action.payload;
      const newState = cloneDeep(state);
      
      // Remove member
      newState.members = reject(newState.members, { id: memberId });
      
      // Remove member from all classes
      newState.classes.forEach(cls => {
        cls.enrolled = reject(cls.enrolled, id => id === memberId);
      });
      
      // Remove attendance records
      newState.attendance = reject(newState.attendance, { memberId });
      
      return newState;
    }

    // Class Actions
    case DatasetActionType.ADD_CLASS:
      return {
        ...state,
        classes: [...state.classes, action.payload],
      };

    case DatasetActionType.UPDATE_CLASS: {
      const newState = cloneDeep(state);
      const classIndex = findIndex(newState.classes, { id: action.payload.id });
      if (classIndex !== -1) {
        newState.classes[classIndex] = action.payload;
      }
      return newState;
    }

    case DatasetActionType.DELETE_CLASS: {
      const classId = action.payload;
      const newState = cloneDeep(state);
      
      // Remove class
      newState.classes = reject(newState.classes, { id: classId });
      
      // Remove attendance records for this class
      newState.attendance = reject(newState.attendance, { classId });
      
      // Update trainer assignments
      newState.trainers.forEach(trainer => {
        trainer.assignedClasses = reject(trainer.assignedClasses, id => id === classId);
      });
      
      return newState;
    }

    // Membership Plan Actions
    case DatasetActionType.ADD_MEMBERSHIP_PLAN:
      return {
        ...state,
        membershipPlans: [...state.membershipPlans, action.payload],
      };

    case DatasetActionType.UPDATE_MEMBERSHIP_PLAN: {
      const newState = cloneDeep(state);
      const planIndex = findIndex(newState.membershipPlans, { id: action.payload.id });
      if (planIndex !== -1) {
        newState.membershipPlans[planIndex] = action.payload;
      }
      return newState;
    }

    case DatasetActionType.DELETE_MEMBERSHIP_PLAN:
      return {
        ...state,
        membershipPlans: reject(state.membershipPlans, { id: action.payload }),
      };

    // Trainer Actions
    case DatasetActionType.ADD_TRAINER:
      return {
        ...state,
        trainers: [...state.trainers, action.payload],
      };

    case DatasetActionType.UPDATE_TRAINER: {
      const newState = cloneDeep(state);
      const trainerIndex = findIndex(newState.trainers, { id: action.payload.id });
      if (trainerIndex !== -1) {
        newState.trainers[trainerIndex] = action.payload;
      }
      return newState;
    }

    case DatasetActionType.DELETE_TRAINER: {
      const trainerId = action.payload;
      const newState = cloneDeep(state);
      
      // Remove trainer
      newState.trainers = reject(newState.trainers, { id: trainerId });
      
      // Update classes that had this trainer
      newState.classes.forEach(cls => {
        if (cls.trainerId === trainerId) {
          cls.trainerId = 0; // Unassigned
        }
      });
      
      return newState;
    }

    // Attendance Actions
    case DatasetActionType.ADD_ATTENDANCE:
      return {
        ...state,
        attendance: [...state.attendance, action.payload],
      };

    case DatasetActionType.UPDATE_ATTENDANCE: {
      const newState = cloneDeep(state);
      const attendanceIndex = findIndex(newState.attendance, { id: action.payload.id });
      if (attendanceIndex !== -1) {
        newState.attendance[attendanceIndex] = action.payload;
      }
      return newState;
    }

    case DatasetActionType.DELETE_ATTENDANCE:
      return {
        ...state,
        attendance: reject(state.attendance, { id: action.payload }),
      };

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

  // Auto-save to localStorage
  useEffect(() => {
    const autoSaveInterval = state.userProfile.preferences.autoSaveInterval * 60 * 1000; // Convert to milliseconds
    
    const intervalId = setInterval(() => {
      localStorage.setItem('lotus-fitness-data', JSON.stringify(state));
      // Could show toast notification here
      console.log('Data auto-saved to localStorage');
    }, autoSaveInterval);

    return () => clearInterval(intervalId);
  }, [state]);

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
};

// Enhanced selector hooks with performance optimizations
export function useUserProfile(): UserProfile {
  const { userProfile } = useDataset();
  return useMemo(() => userProfile, [userProfile]);
}

export function useMembers(): Member[] {
  const { members } = useDataset();
  return useMemo(() => members, [members]);
}

export function useClasses(): FitnessClass[] {
  const { classes } = useDataset();
  return useMemo(() => classes, [classes]);
}

export function useMembershipPlans(): MembershipPlan[] {
  const { membershipPlans } = useDataset();
  return useMemo(() => membershipPlans, [membershipPlans]);
}

export function useTrainers(): Trainer[] {
  const { trainers } = useDataset();
  return useMemo(() => trainers, [trainers]);
}

export function useAttendance(): AttendanceRecord[] {
  const { attendance } = useDataset();
  return useMemo(() => attendance, [attendance]);
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
  const dataStr = JSON.stringify(data, null, 2);
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