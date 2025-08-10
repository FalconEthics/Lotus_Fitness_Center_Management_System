import { 
  createContext, 
  useContext, 
  useReducer, 
  useMemo, 
  ReactNode, 
  useCallback,
  startTransition,
  useId
} from 'react';
import { cloneDeep, findIndex, reject, defaults, debounce, isEqual } from 'lodash';
import {
  Dataset,
  DatasetAction,
  DatasetActionType,
  Member,
  FitnessClass,
} from '../types';
import { useOptimisticStateWithErrorHandling } from '../hooks/useOptimisticState';
import { useEnhancedTransition } from '../hooks/useTransition';

// Enhanced action types with optimistic updates
export enum EnhancedDatasetActionType {
  // Existing actions
  SET_DATASET = 'SET_DATASET',
  ADD_MEMBER = 'ADD_MEMBER',
  UPDATE_MEMBER = 'UPDATE_MEMBER',
  DELETE_MEMBER = 'DELETE_MEMBER',
  ADD_CLASS = 'ADD_CLASS',
  UPDATE_CLASS = 'UPDATE_CLASS',
  DELETE_CLASS = 'DELETE_CLASS',
  
  // New optimistic actions
  OPTIMISTIC_ADD_MEMBER = 'OPTIMISTIC_ADD_MEMBER',
  OPTIMISTIC_UPDATE_MEMBER = 'OPTIMISTIC_UPDATE_MEMBER',
  OPTIMISTIC_DELETE_MEMBER = 'OPTIMISTIC_DELETE_MEMBER',
  OPTIMISTIC_ADD_CLASS = 'OPTIMISTIC_ADD_CLASS',
  OPTIMISTIC_UPDATE_CLASS = 'OPTIMISTIC_UPDATE_CLASS',
  OPTIMISTIC_DELETE_CLASS = 'OPTIMISTIC_DELETE_CLASS',
  
  // Batch operations
  BATCH_UPDATE_MEMBERS = 'BATCH_UPDATE_MEMBERS',
  BATCH_UPDATE_CLASSES = 'BATCH_UPDATE_CLASSES',
  
  // Undo/Redo
  UNDO = 'UNDO',
  REDO = 'REDO',
  CLEAR_HISTORY = 'CLEAR_HISTORY',
}

interface EnhancedDatasetState extends Dataset {
  history: Dataset[];
  future: Dataset[];
  isOptimistic: boolean;
  pendingActions: Set<string>;
  errors: Record<string, Error>;
}

interface EnhancedDatasetAction extends DatasetAction {
  meta?: {
    actionId?: string;
    optimistic?: boolean;
    skipHistory?: boolean;
  };
}

// Enhanced reducer with history and optimistic updates
function enhancedDatasetReducer(
  state: EnhancedDatasetState, 
  action: EnhancedDatasetAction
): EnhancedDatasetState {
  const { type, payload, meta = {} } = action;
  const { actionId, optimistic = false, skipHistory = false } = meta;

  // Helper to add to history
  const addToHistory = (newState: Dataset) => {
    if (skipHistory) return state.history;
    return [
      ...state.history.slice(-49), // Keep last 50 states
      { members: state.members, classes: state.classes }
    ];
  };

  // Helper to clear future when making new changes
  const clearFuture = () => (skipHistory ? state.future : []);

  switch (type) {
    case EnhancedDatasetActionType.SET_DATASET: {
      const newState = defaults({}, payload, { members: [], classes: [] });
      return {
        ...state,
        ...newState,
        history: addToHistory(newState),
        future: clearFuture(),
      };
    }

    case EnhancedDatasetActionType.ADD_MEMBER:
    case EnhancedDatasetActionType.OPTIMISTIC_ADD_MEMBER: {
      const newMembers = [...state.members, payload];
      return {
        ...state,
        members: newMembers,
        history: addToHistory({ members: newMembers, classes: state.classes }),
        future: clearFuture(),
        isOptimistic: optimistic,
        pendingActions: optimistic && actionId 
          ? new Set([...state.pendingActions, actionId])
          : state.pendingActions,
      };
    }

    case EnhancedDatasetActionType.UPDATE_MEMBER:
    case EnhancedDatasetActionType.OPTIMISTIC_UPDATE_MEMBER: {
      const newState = cloneDeep(state);
      const memberIndex = findIndex(newState.members, { id: payload.id });
      if (memberIndex !== -1) {
        newState.members[memberIndex] = payload;
      }
      return {
        ...newState,
        history: addToHistory({ members: newState.members, classes: newState.classes }),
        future: clearFuture(),
        isOptimistic: optimistic,
        pendingActions: optimistic && actionId 
          ? new Set([...state.pendingActions, actionId])
          : state.pendingActions,
      };
    }

    case EnhancedDatasetActionType.DELETE_MEMBER:
    case EnhancedDatasetActionType.OPTIMISTIC_DELETE_MEMBER: {
      const memberId = payload;
      const newState = cloneDeep(state);
      
      newState.members = reject(newState.members, { id: memberId });
      newState.classes.forEach(cls => {
        cls.enrolled = reject(cls.enrolled, id => id === memberId);
      });
      
      return {
        ...newState,
        history: addToHistory({ members: newState.members, classes: newState.classes }),
        future: clearFuture(),
        isOptimistic: optimistic,
        pendingActions: optimistic && actionId 
          ? new Set([...state.pendingActions, actionId])
          : state.pendingActions,
      };
    }

    case EnhancedDatasetActionType.ADD_CLASS:
    case EnhancedDatasetActionType.OPTIMISTIC_ADD_CLASS: {
      const newClasses = [...state.classes, payload];
      return {
        ...state,
        classes: newClasses,
        history: addToHistory({ members: state.members, classes: newClasses }),
        future: clearFuture(),
        isOptimistic: optimistic,
        pendingActions: optimistic && actionId 
          ? new Set([...state.pendingActions, actionId])
          : state.pendingActions,
      };
    }

    case EnhancedDatasetActionType.UPDATE_CLASS:
    case EnhancedDatasetActionType.OPTIMISTIC_UPDATE_CLASS: {
      const newState = cloneDeep(state);
      const classIndex = findIndex(newState.classes, { id: payload.id });
      if (classIndex !== -1) {
        newState.classes[classIndex] = payload;
      }
      return {
        ...newState,
        history: addToHistory({ members: newState.members, classes: newState.classes }),
        future: clearFuture(),
        isOptimistic: optimistic,
        pendingActions: optimistic && actionId 
          ? new Set([...state.pendingActions, actionId])
          : state.pendingActions,
      };
    }

    case EnhancedDatasetActionType.DELETE_CLASS:
    case EnhancedDatasetActionType.OPTIMISTIC_DELETE_CLASS: {
      const newClasses = reject(state.classes, { id: payload });
      return {
        ...state,
        classes: newClasses,
        history: addToHistory({ members: state.members, classes: newClasses }),
        future: clearFuture(),
        isOptimistic: optimistic,
        pendingActions: optimistic && actionId 
          ? new Set([...state.pendingActions, actionId])
          : state.pendingActions,
      };
    }

    case EnhancedDatasetActionType.BATCH_UPDATE_MEMBERS: {
      return {
        ...state,
        members: payload,
        history: addToHistory({ members: payload, classes: state.classes }),
        future: clearFuture(),
      };
    }

    case EnhancedDatasetActionType.BATCH_UPDATE_CLASSES: {
      return {
        ...state,
        classes: payload,
        history: addToHistory({ members: state.members, classes: payload }),
        future: clearFuture(),
      };
    }

    case EnhancedDatasetActionType.UNDO: {
      if (state.history.length === 0) return state;
      
      const previous = state.history[state.history.length - 1];
      const newHistory = state.history.slice(0, -1);
      const newFuture = [
        { members: state.members, classes: state.classes },
        ...state.future.slice(0, 49)
      ];

      return {
        ...state,
        ...previous,
        history: newHistory,
        future: newFuture,
        isOptimistic: false,
        pendingActions: new Set(),
      };
    }

    case EnhancedDatasetActionType.REDO: {
      if (state.future.length === 0) return state;
      
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      const newHistory = [
        ...state.history,
        { members: state.members, classes: state.classes }
      ].slice(-49);

      return {
        ...state,
        ...next,
        history: newHistory,
        future: newFuture,
        isOptimistic: false,
        pendingActions: new Set(),
      };
    }

    case EnhancedDatasetActionType.CLEAR_HISTORY: {
      return {
        ...state,
        history: [],
        future: [],
        pendingActions: new Set(),
        errors: {},
      };
    }

    default:
      return state;
  }
}

// Enhanced context types
interface EnhancedDatasetContextType extends EnhancedDatasetState {
  canUndo: boolean;
  canRedo: boolean;
}

interface EnhancedDatasetDispatchContextType {
  dispatch: (action: EnhancedDatasetAction) => void;
  optimisticDispatch: (action: EnhancedDatasetAction) => Promise<void>;
  batchDispatch: (actions: EnhancedDatasetAction[]) => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
}

// Context creation
const EnhancedDatasetContext = createContext<EnhancedDatasetContextType | null>(null);
const EnhancedDatasetDispatchContext = createContext<EnhancedDatasetDispatchContextType | null>(null);

// Initial state
const initialEnhancedState: EnhancedDatasetState = {
  members: [],
  classes: [],
  history: [],
  future: [],
  isOptimistic: false,
  pendingActions: new Set(),
  errors: {},
};

// Provider component
interface EnhancedDatasetProviderProps {
  children: ReactNode;
  onError?: (error: Error) => void;
}

export function EnhancedDatasetProvider({ children, onError }: EnhancedDatasetProviderProps) {
  const [state, dispatch] = useReducer(enhancedDatasetReducer, initialEnhancedState);
  const { startTransition } = useEnhancedTransition();
  const actionIdRef = useId();

  // Memoized context values
  const contextValue = useMemo<EnhancedDatasetContextType>(() => ({
    ...state,
    canUndo: state.history.length > 0,
    canRedo: state.future.length > 0,
  }), [state]);

  // Optimistic dispatch with error handling
  const optimisticDispatch = useCallback(async (action: EnhancedDatasetAction) => {
    const actionId = `${actionIdRef}-${Date.now()}`;
    const optimisticAction = {
      ...action,
      meta: { ...action.meta, actionId, optimistic: true }
    };

    // Dispatch optimistic update immediately
    dispatch(optimisticAction);

    try {
      // Simulate API call delay (replace with actual API calls)
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Commit the change
      const commitAction = {
        ...action,
        meta: { ...action.meta, actionId, optimistic: false }
      };
      
      startTransition(() => {
        dispatch(commitAction);
      });
    } catch (error) {
      // Rollback on error
      const rollbackAction = {
        type: EnhancedDatasetActionType.UNDO,
        payload: null,
        meta: { actionId, skipHistory: true }
      };
      
      dispatch(rollbackAction);
      onError?.(error instanceof Error ? error : new Error('Unknown error'));
      throw error;
    }
  }, [startTransition, onError, actionIdRef]);

  // Batch dispatch for multiple operations
  const batchDispatch = useCallback((actions: EnhancedDatasetAction[]) => {
    startTransition(() => {
      actions.forEach(action => dispatch(action));
    });
  }, [startTransition]);

  // Undo/Redo functions
  const undo = useCallback(() => {
    dispatch({ type: EnhancedDatasetActionType.UNDO, payload: null });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: EnhancedDatasetActionType.REDO, payload: null });
  }, []);

  const clearHistory = useCallback(() => {
    dispatch({ type: EnhancedDatasetActionType.CLEAR_HISTORY, payload: null });
  }, []);

  const dispatchValue = useMemo<EnhancedDatasetDispatchContextType>(() => ({
    dispatch,
    optimisticDispatch,
    batchDispatch,
    undo,
    redo,
    clearHistory,
  }), [dispatch, optimisticDispatch, batchDispatch, undo, redo, clearHistory]);

  return (
    <EnhancedDatasetContext.Provider value={contextValue}>
      <EnhancedDatasetDispatchContext.Provider value={dispatchValue}>
        {children}
      </EnhancedDatasetDispatchContext.Provider>
    </EnhancedDatasetContext.Provider>
  );
}

// Custom hooks
export function useEnhancedDataset(): EnhancedDatasetContextType {
  const context = useContext(EnhancedDatasetContext);
  if (context === null) {
    throw new Error('useEnhancedDataset must be used within an EnhancedDatasetProvider');
  }
  return context;
}

export function useEnhancedDatasetDispatch(): EnhancedDatasetDispatchContextType {
  const context = useContext(EnhancedDatasetDispatchContext);
  if (context === null) {
    throw new Error('useEnhancedDatasetDispatch must be used within an EnhancedDatasetProvider');
  }
  return context;
}

// Enhanced action creators
export const enhancedDatasetActions = {
  // Optimistic actions
  optimisticAddMember: (member: Member): EnhancedDatasetAction => ({
    type: EnhancedDatasetActionType.OPTIMISTIC_ADD_MEMBER,
    payload: member,
  }),

  optimisticUpdateMember: (member: Member): EnhancedDatasetAction => ({
    type: EnhancedDatasetActionType.OPTIMISTIC_UPDATE_MEMBER,
    payload: member,
  }),

  optimisticDeleteMember: (memberId: number): EnhancedDatasetAction => ({
    type: EnhancedDatasetActionType.OPTIMISTIC_DELETE_MEMBER,
    payload: memberId,
  }),

  optimisticAddClass: (classData: FitnessClass): EnhancedDatasetAction => ({
    type: EnhancedDatasetActionType.OPTIMISTIC_ADD_CLASS,
    payload: classData,
  }),

  optimisticUpdateClass: (classData: FitnessClass): EnhancedDatasetAction => ({
    type: EnhancedDatasetActionType.OPTIMISTIC_UPDATE_CLASS,
    payload: classData,
  }),

  optimisticDeleteClass: (classId: number): EnhancedDatasetAction => ({
    type: EnhancedDatasetActionType.OPTIMISTIC_DELETE_CLASS,
    payload: classId,
  }),

  // Batch actions
  batchUpdateMembers: (members: Member[]): EnhancedDatasetAction => ({
    type: EnhancedDatasetActionType.BATCH_UPDATE_MEMBERS,
    payload: members,
  }),

  batchUpdateClasses: (classes: FitnessClass[]): EnhancedDatasetAction => ({
    type: EnhancedDatasetActionType.BATCH_UPDATE_CLASSES,
    payload: classes,
  }),
};