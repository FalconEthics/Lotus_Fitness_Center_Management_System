// Core data model types
export interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  membershipType: 'Basic' | 'Premium' | 'VIP';
  startDate: string;
}

export interface FitnessClass {
  id: number;
  name: string;
  instructor: string;
  schedule: string;
  capacity: number;
  enrolled: number[];
}

// Dataset type combining members and classes
export interface Dataset {
  members: Member[];
  classes: FitnessClass[];
}

// Action types for the reducer
export enum DatasetActionType {
  SET_DATASET = 'SET_DATASET',
  ADD_MEMBER = 'ADD_MEMBER',
  UPDATE_MEMBER = 'UPDATE_MEMBER',
  DELETE_MEMBER = 'DELETE_MEMBER',
  ADD_CLASS = 'ADD_CLASS',
  UPDATE_CLASS = 'UPDATE_CLASS',
  DELETE_CLASS = 'DELETE_CLASS',
}

// Action interfaces
export interface SetDatasetAction {
  type: DatasetActionType.SET_DATASET;
  payload: Dataset;
}

export interface AddMemberAction {
  type: DatasetActionType.ADD_MEMBER;
  payload: Member;
}

export interface UpdateMemberAction {
  type: DatasetActionType.UPDATE_MEMBER;
  payload: Member;
}

export interface DeleteMemberAction {
  type: DatasetActionType.DELETE_MEMBER;
  payload: number;
}

export interface AddClassAction {
  type: DatasetActionType.ADD_CLASS;
  payload: FitnessClass;
}

export interface UpdateClassAction {
  type: DatasetActionType.UPDATE_CLASS;
  payload: FitnessClass;
}

export interface DeleteClassAction {
  type: DatasetActionType.DELETE_CLASS;
  payload: number;
}

// Union type for all dataset actions
export type DatasetAction =
  | SetDatasetAction
  | AddMemberAction
  | UpdateMemberAction
  | DeleteMemberAction
  | AddClassAction
  | UpdateClassAction
  | DeleteClassAction;

// Form input types
export interface FormInputProps {
  type: 'text' | 'email' | 'date' | 'select' | 'range';
  placeholder: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  options?: string[];
}

// Component prop types
export interface MemberCardProps {
  member: Member;
}

export interface StatCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  value: number;
}

export interface SidebarItemProps {
  to: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
}

export interface LayoutProps {
  children: React.ReactNode;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export interface ErrorModalProps {
  Error: string;
}

// Context types
export interface DatasetContextType {
  members: Member[];
  classes: FitnessClass[];
}

export type DatasetDispatchContextType = React.Dispatch<DatasetAction>;

// HOC types
export interface WithAuthAndDatasetProps {
  [key: string]: unknown;
}

// Membership types as const assertion for better type safety
export const MEMBERSHIP_TYPES = ['Basic', 'Premium', 'VIP'] as const;
export type MembershipType = typeof MEMBERSHIP_TYPES[number];