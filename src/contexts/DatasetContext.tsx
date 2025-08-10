import { createContext, useContext, useReducer, useMemo, ReactNode } from 'react';
import {
  Dataset,
  DatasetAction,
  DatasetActionType,
  DatasetContextType,
  DatasetDispatchContextType,
  Member,
  FitnessClass,
} from '../types';

// Initial state
const initialState: Dataset = {
  members: [],
  classes: [],
};

// Reducer following Redux Toolkit patterns but with immutable updates
function datasetReducer(state: Dataset, action: DatasetAction): Dataset {
  switch (action.type) {
    case DatasetActionType.SET_DATASET:
      return {
        ...state,
        members: action.payload.members || [],
        classes: action.payload.classes || [],
      };

    case DatasetActionType.ADD_MEMBER:
      return {
        ...state,
        members: [...state.members, action.payload],
      };

    case DatasetActionType.UPDATE_MEMBER: {
      const updatedMembers = state.members.map(member =>
        member.id === action.payload.id ? action.payload : member
      );
      return {
        ...state,
        members: updatedMembers,
      };
    }

    case DatasetActionType.DELETE_MEMBER: {
      const memberId = action.payload;
      const filteredMembers = state.members.filter(member => member.id !== memberId);
      // Remove member from all classes
      const updatedClasses = state.classes.map(cls => ({
        ...cls,
        enrolled: cls.enrolled.filter(id => id !== memberId),
      }));
      
      return {
        ...state,
        members: filteredMembers,
        classes: updatedClasses,
      };
    }

    case DatasetActionType.ADD_CLASS:
      return {
        ...state,
        classes: [...state.classes, action.payload],
      };

    case DatasetActionType.UPDATE_CLASS: {
      const updatedClasses = state.classes.map(cls =>
        cls.id === action.payload.id ? action.payload : cls
      );
      return {
        ...state,
        classes: updatedClasses,
      };
    }

    case DatasetActionType.DELETE_CLASS: {
      const filteredClasses = state.classes.filter(cls => cls.id !== action.payload);
      return {
        ...state,
        classes: filteredClasses,
      };
    }

    default:
      return state;
  }
}

// Context creation with proper typing
const DatasetContext = createContext<DatasetContextType | null>(null);
const DatasetDispatchContext = createContext<DatasetDispatchContextType | null>(null);

// Provider component with performance optimizations
interface DatasetProviderProps {
  children: ReactNode;
}

export function DatasetProvider({ children }: DatasetProviderProps) {
  const [state, dispatch] = useReducer(datasetReducer, initialState);

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

// Action creators for better DX and type safety
export const datasetActions = {
  setDataset: (data: Dataset): DatasetAction => ({
    type: DatasetActionType.SET_DATASET,
    payload: data,
  }),
  
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
};

// Selector hooks for better performance (similar to useSelector but with memoization)
export function useMembers(): Member[] {
  const { members } = useDataset();
  return useMemo(() => members, [members]);
}

export function useClasses(): FitnessClass[] {
  const { classes } = useDataset();
  return useMemo(() => classes, [classes]);
}

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