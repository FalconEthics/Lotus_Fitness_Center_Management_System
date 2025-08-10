import { createContext, useContext, useReducer, useMemo, ReactNode } from 'react';
import { cloneDeep, findIndex, reject, defaults } from 'lodash';
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
      // Use Lodash defaults for cleaner null/undefined handling
      return defaults({}, action.payload, { members: [], classes: [] });

    case DatasetActionType.ADD_MEMBER:
      return {
        ...state,
        members: [...state.members, action.payload],
      };

    case DatasetActionType.UPDATE_MEMBER: {
      // Use Lodash cloneDeep for immutability and findIndex for performance
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
      
      // Use Lodash reject for cleaner filtering
      newState.members = reject(newState.members, { id: memberId });
      
      // Remove member from all classes efficiently
      newState.classes.forEach(cls => {
        cls.enrolled = reject(cls.enrolled, id => id === memberId);
      });
      
      return newState;
    }

    case DatasetActionType.ADD_CLASS:
      return {
        ...state,
        classes: [...state.classes, action.payload],
      };

    case DatasetActionType.UPDATE_CLASS: {
      // Use Lodash cloneDeep and findIndex for better performance
      const newState = cloneDeep(state);
      const classIndex = findIndex(newState.classes, { id: action.payload.id });
      if (classIndex !== -1) {
        newState.classes[classIndex] = action.payload;
      }
      return newState;
    }

    case DatasetActionType.DELETE_CLASS: {
      // Use Lodash reject for cleaner filtering
      return {
        ...state,
        classes: reject(state.classes, { id: action.payload }),
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